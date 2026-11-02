import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { RootState } from '@config';
import { getCurrencySymbol } from '@enums';
import { IBillItem } from '@interfaces';
import { currencyFormat, getBillItemTotal } from '@utils';

const { Text } = Typography;

interface Props {
  item: IBillItem;
}

/**
 * "Quantity: 2   Total: ฿ 470.80 (Service 10% ฿ 40.00, VAT 7% ฿ 30.80)". The part in
 * brackets is grey and lists only the charges the item has.
 */
const ItemPriceLine: React.FC<Props> = ({ item }) => {
  const { t } = useTranslation();
  const mainCurrency = useSelector(
    (state: RootState) => state.app.mainCurrency,
  );
  const fmt = (amount: number) =>
    `${getCurrencySymbol(mainCurrency)} ${currencyFormat(amount)}`;

  const charges = [
    item.service > 0 &&
      t('mapping.itemPrice.service', {
        percent: item.servicePercentage,
        amount: fmt(item.service),
      }),
    item.vat > 0 &&
      t('mapping.itemPrice.vat', {
        percent: item.vatPercentage,
        amount: fmt(item.vat),
      }),
  ].filter(Boolean);

  return (
    <div>
      <Text italic>
        {t('common.text.quantity')}: {item.quantity}
        {'\u00a0\u00a0\u00a0'}
        {t('common.text.total')}: {fmt(getBillItemTotal(item))}
      </Text>
      {charges.length > 0 && (
        <Text type="secondary"> ({charges.join(', ')})</Text>
      )}
    </div>
  );
};

export default ItemPriceLine;
