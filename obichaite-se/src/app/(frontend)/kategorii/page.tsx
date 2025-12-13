import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { CategoriesSection } from '@/components/Categories'
import { Category } from '@/payload-types'
import { GenericHeading } from '@/components/Generic'

export default async function Categories() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'category',
    draft: false,
    limit: 2000,
    overrideAccess: false,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    select: {
      title: true,
      slug: true,
      media: true,
      description: true,
      heading: true,
      mediaMobile: true,
    },
    sort: 'createdAt',
  })

  return (
    <article className="w-full pt-[96px] md:pt-[164px]">
      <GenericHeading
        extraClass="pt-4 md:pt-8 bg-pink/30 border-b-[1px] border-bordo/80"
        align="text-center"
        headingType="h1"
        fontStyle="font-sansation font-[700]"
        textColor="text-bordo"
      >
        Категории
      </GenericHeading>
      <CategoriesSection categories={categories.docs as Category[]} />
    </article>
  )
}
