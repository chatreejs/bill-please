import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Flex,
  InputNumber,
  Select,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@config';
import { CURRENCIES } from '@enums';
import { addExchangeRate, removeExchangeRate, setMainCurrency } from '@slices';

const CurrencySettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const mainCurrency = useSelector(
    (state: RootState) => state.app.mainCurrency,
  );
  const exchangeRates = useSelector(
    (state: RootState) => state.app.exchangeRates ?? [],
  );

  const [isAddingRate, setIsAddingRate] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState<string | undefined>(
    undefined,
  );
  const [rate, setRate] = useState<number | null>(null);

  const currencyOptions = CURRENCIES.map((c) => ({
    label: `${c.code} (${c.symbol})`,
    value: c.code,
  }));

  const availableForExchange = CURRENCIES.filter(
    (c) =>
      c.code !== mainCurrency &&
      !exchangeRates.find((r) => r.currency === c.code),
  ).map((c) => ({
    label: `${c.code} (${c.symbol})`,
    value: c.code,
  }));

  const handleAddRate = () => {
    if (!targetCurrency || !rate) return;
    dispatch(addExchangeRate({ currency: targetCurrency, rate }));
    setTargetCurrency(undefined);
    setRate(null);
    setIsAddingRate(false);
  };

  const handleCancelAddRate = () => {
    setTargetCurrency(undefined);
    setRate(null);
    setIsAddingRate(false);
  };

  return (
    <Collapse
      ghost
      size="small"
      items={[
        {
          key: '1',
          label: (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {t('currency.settings')}
            </Typography.Text>
          ),
          children: (
            <>
              <Flex gap={8} align="center" style={{ marginBottom: 10 }}>
                <Typography.Text style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                  {t('currency.baseCurrency')}:
                </Typography.Text>
                <Select
                  size="small"
                  options={currencyOptions}
                  value={mainCurrency}
                  onChange={(value) => dispatch(setMainCurrency(value))}
                  style={{ minWidth: 90 }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Flex>

              {exchangeRates.length > 0 && (
                <Flex wrap gap={4} style={{ marginBottom: 8 }}>
                  {exchangeRates.map((er) => (
                    <Tag
                      key={er.currency}
                      style={{ cursor: 'default' }}
                      closeIcon={<DeleteOutlined style={{ color: 'red' }} />}
                      closable
                      onClose={() => dispatch(removeExchangeRate(er.currency))}
                    >
                      1 {mainCurrency} = {er.rate} {er.currency}
                    </Tag>
                  ))}
                </Flex>
              )}

              {isAddingRate ? (
                <Flex gap={6} align="center" wrap>
                  <Select
                    size="small"
                    placeholder={t('currency.targetCurrency')}
                    options={availableForExchange}
                    value={targetCurrency}
                    onChange={setTargetCurrency}
                    style={{ minWidth: 90 }}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                  <InputNumber
                    size="small"
                    placeholder={t('currency.rate')}
                    min={0.000001}
                    step={0.01}
                    value={rate}
                    onChange={setRate}
                    style={{ width: 150 }}
                    addonBefore={
                      targetCurrency ? `1 ${mainCurrency} =` : undefined
                    }
                  />
                  <Flex gap={4}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={handleAddRate}
                      disabled={!targetCurrency || !rate}
                    >
                      {t('common.button.save')}
                    </Button>
                    <Button size="small" onClick={handleCancelAddRate}>
                      {t('common.button.cancel')}
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                availableForExchange.length > 0 && (
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddingRate(true)}
                  >
                    {t('currency.addRate')}
                  </Button>
                )
              )}
            </>
          ),
        },
      ]}
    />
  );
};

export default CurrencySettings;
