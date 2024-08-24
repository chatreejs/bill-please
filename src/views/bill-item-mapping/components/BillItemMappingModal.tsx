import { RootState } from '@config';
import { addBillItemMapping, editBillItemMapping } from '@slices';
import { Modal, Select } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  isOpen: boolean;
  itemId: string;
  onClose: () => void;
}

const BillItemMappingModal: React.FC<Props> = ({ isOpen, itemId, onClose }) => {
  const billPayers = useSelector((state: RootState) => state.bill.payers);
  const billItemMappings = useSelector(
    (state: RootState) => state.bill.itemMapping,
  );
  const dispatch = useDispatch();
  const [selectedPayerIds, setSelectedPayerIds] = React.useState<string[]>([]);

  const handleChange = (selectedPayerIds: string[]) => {
    setSelectedPayerIds(selectedPayerIds);
  };

  const getAllPayer = () => {
    const allPayers = [...billPayers];
    billPayers.forEach((payer) => {
      if (payer.friend) {
        payer.friend.forEach((friend) => {
          allPayers.push({
            id: friend.id,
            name: friend.name,
          });
        });
      }
    });
    return allPayers.map((payer) => ({
      label: payer.name,
      value: payer.id,
    }));
  };

  const saveItemMapping = () => {
    const itemMapping = billItemMappings.find(
      (mapping) => mapping.itemId === itemId,
    );
    if (itemMapping) {
      dispatch(
        editBillItemMapping({
          itemId,
          payerId: selectedPayerIds,
        }),
      );
    } else {
      dispatch(
        addBillItemMapping({
          itemId,
          payerId: selectedPayerIds,
        }),
      );
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const itemMapping = billItemMappings.find(
        (mapping) => mapping.itemId === itemId,
      );
      if (itemMapping) {
        setSelectedPayerIds(itemMapping.payerId);
      } else {
        setSelectedPayerIds([]);
      }
    }

    return () => {
      setSelectedPayerIds([]);
    };
  }, [isOpen, itemId]);

  return (
    <Modal
      title={'Select payer'}
      open={isOpen}
      onOk={saveItemMapping}
      onCancel={onClose}
    >
      <Select
        mode="tags"
        size="large"
        style={{ width: '100%' }}
        placeholder="Please select payer"
        onChange={handleChange}
        options={getAllPayer()}
        value={selectedPayerIds}
      />
    </Modal>
  );
};

export default BillItemMappingModal;
