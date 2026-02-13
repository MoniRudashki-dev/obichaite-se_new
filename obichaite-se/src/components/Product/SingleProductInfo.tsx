import { Category, Product } from '@/payload-types'
import React from 'react'
import { GenericParagraph } from '../Generic'
import { RichTextFull } from '../Custom'
import Link from 'next/link'

const SingleProductInfo = ({ product }: { product: Product }) => {
  const { description } = product

  return (
    <div className="flex-1 relative order-3">
      <div className="hidden md:block absolute left-0 top-[48px] w-[1px] h-[calc(100%-96px)] bg-brown/20 z-[2]"></div>
      <div className="hidden md:block absolute right-0 top-[48px] w-[1px] h-[calc(100%-96px)] bg-brown/20 z-[2]"></div>
      <div className="flex flex-col p-4 md:p-6 w-full h-full">
        <GenericParagraph
          fontStyle="font-sansation font-[700]"
          pType="large"
          textColor="text-brown"
          extraClass="uppercase md:text-right"
        >
          Описание:
        </GenericParagraph>

        <div className="md:max-h-[280px] md:overflow-y-auto md:mt-4">
          <GenericParagraph
            fontStyle="font-sansation font-[400]"
            pType="regular"
            textColor="text-brown"
            extraClass="md:text-right"
          >
            <RichTextFull description={description} className="md:!py-0 pr-1" />
          </GenericParagraph>
        </div>

        <div className="mt-auto w-full flex flex-col gap-3">
          <GenericParagraph
            fontStyle="font-sansation font-[700]"
            pType="large"
            textColor="text-brown"
            extraClass="uppercase md:text-right"
          >
            За Продукта:
          </GenericParagraph>

          <GenericParagraph
            fontStyle="font-kolka font-[400]"
            pType="regular"
            textColor="text-brown"
            extraClass="md:text-right"
          >
            <span className="font-[500]">
              <strong>СКУ:</strong>{' '}
            </span>{' '}
            {product.sku || product.id}
          </GenericParagraph>

          <Link prefetch={true} href={`/kategorii/${(product.category as Category)?.slug}`}>
            <GenericParagraph
              fontStyle="font-kolka font-[400]"
              pType="regular"
              textColor="text-brown"
              extraClass="md:text-right"
            >
              <span className="font-[500]">
                <strong>Категория:</strong>{' '}
              </span>{' '}
              {(product.category as Category)?.title}
            </GenericParagraph>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SingleProductInfo
