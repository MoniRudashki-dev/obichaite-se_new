'use client'

import { useRef } from 'react'
import { createPortal } from 'react-dom'

import type { Product } from '@/payload-types'

import { ProductInquiryForm } from './ProductInquiryForm'

type Props = {
  open: boolean
  onClose: () => void
  productId: string
  productTitle: string
  fields: NonNullable<Product['inquiryFormFields']>
}

export const ProductInquiryFormModal = ({
  open,
  onClose,
  productId,
  productTitle,
  fields,
}: Props) => {
  const backdropPressStarted = useRef(false)

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px] p-3 sm:p-6"
      onPointerDown={(e) => {
        backdropPressStarted.current = e.target === e.currentTarget
      }}
      onPointerUp={(e) => {
        const shouldClose = backdropPressStarted.current && e.target === e.currentTarget
        backdropPressStarted.current = false
        if (shouldClose) onClose()
      }}
    >
      <div
        className="md:mx-auto mt-4 sm:mt-10 w-full max-w-2xl max-h-[90svh] overflow-hidden rounded-[28px] border border-brown/20 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-brown/10">
          <h3 className="font-sansation font-[700] text-[22px] sm:text-[28px] leading-none text-brown">
            Запитване
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-brown/20 text-brown hover:bg-brown/5"
            aria-label="Затвори"
          >
            x
          </button>
        </div>

        <ProductInquiryForm
          variant="modal"
          productId={productId}
          productTitle={productTitle}
          fields={fields}
          onClose={onClose}
          resetKey={open}
        />
      </div>
    </div>,
    document.body,
  )
}
