import type { CollectionBeforeValidateHook } from 'payload'
import { getDefaultInquiryQuestions } from './inquiryDefaults'

export const ensureInquiryDefaults: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data

  const showInquiryForm = data.showInquiryForm ?? originalDoc?.showInquiryForm
  if (!showInquiryForm) return data

  const currentQuestions = data.inquiryFormFields ?? originalDoc?.inquiryFormFields
  if (!Array.isArray(currentQuestions) || currentQuestions.length === 0) {
    data.inquiryFormFields = getDefaultInquiryQuestions()
  }

  return data
}
