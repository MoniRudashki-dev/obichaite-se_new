'use client'

import { Media, Review } from '@/payload-types'
import React, { useState } from 'react'
import { GenericButton, GenericHeading, GenericImage, GenericParagraph } from '../Generic'
import { StarIcon, StarIconReview } from '@/assets/icons'

const ReviewSection = ({ reviews }: { reviews: Review[] }) => {
  const [showMore, setShowMore] = useState(false)

  const reviewsContent = reviews.map((review) => {
    //render start from the rating
    const startLength = Number(review.rating)
    const stars = Array.from({ length: startLength }, (_, index) => index + 1).map((review) => {
      return (
        <div key={review} className="flex justify-center items-center">
          <StarIcon />
        </div>
      )
    })

    //render media fallback logo
    const mediaSrc = (review.media as Media)?.url || '/logo.png'

    return (
      <li className="w-full" key={review.id}>
        <div className="rounded-xl border-[1px] border-bordo p-4 md:p-6 pb-4 md:pb-6 flex flex-col white-pink-background">
          <div className="flex flex-col gap-4 md:gap-[unset] xl:flex-row w-full">
            <div className="flex-1 flex flex-col justify-center items-center gap-4 md:gap-5">
              <GenericHeading
                headingType="h5"
                fontStyle="font-sansation font-[700]"
                textColor="text-bordo"
                extraClass="text-center"
              >
                <h5>{review.author}</h5>
              </GenericHeading>

              <div className="flex items-center gap-1">{stars}</div>
            </div>
            <div className="flex-1 md:p-6">
              <GenericImage
                src={mediaSrc}
                alt={review.author}
                wrapperClassName="w-full h-full min-h-[250px] relative"
                imageClassName="w-full h-full object-cover"
                fill={true}
              />
            </div>
          </div>

          <div className="w-full">
            <GenericParagraph
              fontStyle="font-sansation font-[400]"
              textColor="text-brown"
              extraClass="text-center pt-2 border-t-[1px] border-brown/80"
            >
              {review.message}
            </GenericParagraph>
          </div>
        </div>
      </li>
    )
  })

  const overallResults = reviews.reduce((acc, review) => acc + Number(review.rating), 0)
  const overallRating = overallResults / reviews.length

  //calculate percentage
  const percentage = (overallRating * 100) / 5
  const minusPercentage = 100 - percentage

  return (
    <section className="w-full min-h-[100svh] py-10 md:py-20 flex bg-pink/30">
      <div className="w-full content_wrapper m-auto">
        <div className="w-full mb-6 md:mb-10">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <GenericHeading
              headingType="h2"
              fontStyle="font-sansation font-[700]"
              textColor="text-bordo"
              extraClass="border-b-[1px] border-b-bordo/80"
            >
              <h2>Потребителски отзиви</h2>
            </GenericHeading>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <div>
              <GenericParagraph
                fontStyle="font-sansation font-[700]"
                pType="large"
                textColor="text-bordo"
              >
                {overallRating.toFixed(2)}
              </GenericParagraph>
            </div>
            <div className="flex items-center relative bg-white rounded-[12px] px-1 overflow-hidden">
              <div
                className="right-0 top-0 bottom-0 h-[32px] absolute bg-white"
                style={{ width: `${minusPercentage}%` }}
              ></div>
              {Array.from({ length: 5 }, (_, index) => index + 1).map((review) => {
                return (
                  <div key={review} className="flex justify-center items-center size-8">
                    <StarIconReview />
                  </div>
                )
              })}
            </div>
            <div>
              <GenericParagraph
                fontStyle="font-sansation font-[400]"
                pType="large"
                textColor="text-bordo"
              >
                от {reviews.length} потребителски отзиви
              </GenericParagraph>
            </div>
          </div>
        </div>
        <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:mb-10">
          {showMore ? reviewsContent : reviewsContent.slice(0, 2)}
        </ul>

        <div className="border-t-[1px] border-t-bordo/80 flex justify-center item">
          <GenericButton
            click={() => setShowMore(!showMore)}
            styleClass="w-full md:w-auto mt-4 md:mt-6"
          >
            {!showMore ? 'Покажи повече' : 'Покажи по-малко'}
          </GenericButton>
        </div>
      </div>
    </section>
  )
}

export default ReviewSection
