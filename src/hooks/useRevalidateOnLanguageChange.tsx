import { FormInstance } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A form keeps each error as the text it had when the field was checked.
 * Check the fields that show an error again when the language changes, so
 * the error shows in the new language.
 */
const useRevalidateOnLanguageChange = (form: FormInstance) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const fieldsWithError = form
      .getFieldsError()
      .filter((field) => field.errors.length > 0)
      .map((field) => field.name);
    if (fieldsWithError.length > 0) {
      form.validateFields(fieldsWithError).catch(() => undefined);
    }
  }, [i18n.language]);
};

export default useRevalidateOnLanguageChange;
