import { Button, Flex, Form, Input, InputRef, Select, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
  useBlurOnKeyboardClose,
  useBrowserStorage,
  useRevalidateOnLanguageChange,
} from '@hooks';
import { IBankAccount } from '@interfaces';
import {
  ACCOUNT_NUMBER_MAX_LENGTH,
  allowDigitsOnly,
  BANKS,
  formatAccountNumber,
  getBank,
  getBankName,
  isValidAccountNumber,
  toDigits,
  trackEvent,
} from '@utils';

import BankBadge from './BankBadge';

const { Text } = Typography;

const BankName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface BankAccountForm {
  bankId?: string;
  accountNumber?: string;
}

const BankAccount: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm<BankAccountForm>();
  const [bankAccount, setBankAccount] = useBrowserStorage<
    IBankAccount | undefined
  >('bankAccount', undefined, 'local');
  const [isSubmit, setIsSubmit] = useState(false);
  const numberInputRef = useRef<InputRef>(null);
  useRevalidateOnLanguageChange(form);
  useBlurOnKeyboardClose(() => numberInputRef.current?.input, !isSubmit);
  const savedBank = getBank(bankAccount?.bankId);

  const onSubmit = () => {
    form
      .validateFields()
      .then(({ bankId, accountNumber }) => {
        if (!bankId || !accountNumber) return;
        setBankAccount({ bankId, accountNumber: toDigits(accountNumber) });
        setIsSubmit(true);
        trackEvent('bank_account_saved', { bank: bankId, is_restored: false });
      })
      .catch(() => {
        trackEvent('form_validation_failed', { form: 'bank_account' });
      });
  };

  useEffect(() => {
    // Skip the form when the saved number still fits its bank's digit range
    const bank = getBank(bankAccount?.bankId);
    if (bank && bankAccount) {
      form.setFieldsValue({
        bankId: bank.id,
        accountNumber: formatAccountNumber(bankAccount.accountNumber),
      });
      if (isValidAccountNumber(bankAccount.accountNumber, bank)) {
        setIsSubmit(true);
        trackEvent('bank_account_saved', { bank: bank.id, is_restored: true });
      }
    }
  }, [form]);

  if (isSubmit && bankAccount && savedBank) {
    return (
      <Flex vertical justify="center" align="center" gap={8}>
        <div>{t('result.payment.bankAccount.transferTo')}</div>
        <Flex align="center" gap={8}>
          <BankBadge bank={savedBank} size={32} />
          <Text strong>{getBankName(savedBank, i18n.language)}</Text>
        </Flex>
        <Text
          // antd keeps the copy button's label from the first render, so
          // mount it again when the language changes
          key={i18n.language}
          className="bank-account-number"
          style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}
          copyable={{
            text: bankAccount.accountNumber,
            tooltips: [
              t('result.payment.bankAccount.copy'),
              t('result.payment.bankAccount.copied'),
            ],
            onCopy: () =>
              trackEvent('bank_account_copied', { bank: savedBank.id }),
          }}
        >
          {formatAccountNumber(bankAccount.accountNumber)}
        </Text>
        <span
          className="change-bank-account"
          style={{ fontSize: 12, textDecoration: 'underline' }}
          onClick={() => {
            trackEvent('bank_account_changed');
            setIsSubmit(false);
          }}
        >
          {t('result.payment.bankAccount.change')}
        </span>
      </Flex>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      size="middle"
      requiredMark={false}
      style={{ width: '100%', maxWidth: 300 }}
    >
      <Form.Item
        name="bankId"
        label={t('result.payment.bankAccount.bankLabel')}
        rules={[
          {
            required: true,
            message: t('result.payment.bankAccount.bankError'),
          },
        ]}
      >
        <Select
          placeholder={t('result.payment.bankAccount.bankPlaceholder')}
          // The list is short, so render every bank, not only the ones in view
          virtual={false}
          onChange={() => {
            // Check what is already typed against the new bank's digit range
            if (form.getFieldValue('accountNumber')) {
              void form.validateFields(['accountNumber']);
            }
          }}
          options={BANKS.map((bank) => ({
            value: bank.id,
            label: (
              <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                <BankBadge bank={bank} size={22} />
                <BankName>{getBankName(bank, i18n.language)}</BankName>
              </Flex>
            ),
          }))}
        />
      </Form.Item>
      <Form.Item
        name="accountNumber"
        label={t('result.payment.bankAccount.numberLabel')}
        // Check on blur, so the error does not show while the number is half typed
        validateTrigger="onBlur"
        normalize={(value: string) => formatAccountNumber(value)}
        rules={[
          {
            required: true,
            message: t('result.payment.bankAccount.numberError'),
          },
          ({ getFieldValue }) => ({
            // Read the bank from the form, because a bank change validates
            // before the component renders with the new bank
            validator: (_, value: string | undefined) => {
              const bank = getBank(getFieldValue('bankId') as string);
              return !value || !bank || isValidAccountNumber(value, bank)
                ? Promise.resolve()
                : Promise.reject(
                    new Error(
                      t('result.payment.bankAccount.numberFormatError'),
                    ),
                  );
            },
          }),
        ]}
      >
        <Input
          ref={numberInputRef}
          inputMode="numeric"
          autoComplete="off"
          maxLength={ACCOUNT_NUMBER_MAX_LENGTH}
          onKeyDown={allowDigitsOnly}
          onChange={() => {
            // Once an error shows, clear it as soon as the number is fixed
            if (form.getFieldError('accountNumber').length > 0) {
              void form.validateFields(['accountNumber']);
            }
          }}
          placeholder="XXX-X-XXXXX-X"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        />
      </Form.Item>
      <Button type="primary" block onClick={onSubmit}>
        {t('common.button.save')}
      </Button>
    </Form>
  );
};

export default BankAccount;
