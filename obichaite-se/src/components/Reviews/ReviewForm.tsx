'use client'

import React, { useState, useTransition } from 'react'
import { GenericHeading, GenericParagraph, TextArea, TextInput } from '../Generic'
import ErrorMessageBox from '../Generic/ErrorMessage'
import { ArrowIcon, CheckBoxIcon, StarIconReview, StarIconReviewColored } from '@/assets/icons'
import { ReviewImageField } from './ReviewImageField'
import { createReview } from '@/action/reviews'

const ReviewForm = ({ productId }: { productId: number }) => {
  const [itIsClient, setItIsClient] = useState(false)

  const [pending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [acceptNextContacts, setAcceptNextContacts] = useState(false)

  const checkoutValuesInitialState: {
    author: string
    rating: '1' | '2' | '3' | '4' | '5'
    message: string
  } = {
    author: '',
    rating: '5',
    message: '',
  }

  const [formValues, setFormValues] = useState(checkoutValuesInitialState)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({
    author: '',
    message: '',
  })

  const submitHandler = async (formData: FormData) => {
    setError('')

    const author = (formData.get('author') as string | null) ?? ''
    const message = (formData.get('message') as string | null) ?? ''

    const authorError = author.length < 3 ? 'Името трябва да е поне 3 символа' : ''
    const messageError = message.length < 3 ? 'Съобщението трябва да е поне 3 символа' : ''

    if (!acceptTerms || !acceptPrivacy) {
      setError('Трябва да се съгласите с задължителните условия, за потвърждаване на поръчката')
    }

    if (authorError || messageError || !acceptTerms || !acceptPrivacy) {
      setErrors({ author: authorError, message: messageError })
      return
    }

    startTransition(async () => {
      const result = await createReview(formData)

      if (!result?.ok) {
        setError('Възникна грешка при изпращане на отзива')
        return
      }

      setIsSuccess(true)
    })
  }

  //need to make stars input that show five start and each are selecteble field
  const starsInput = Array.from({ length: 5 }, (_, index) => index + 1).map((star) => {
    const itIsColored = star <= Number(formValues.rating)

    return (
      <div key={star} className="flex justify-center items-center">
        <input
          type="radio"
          name="rating"
          id={`star-${star}`}
          value={star}
          onChange={(e) => {
            setFormValues({ ...formValues, rating: e.target.value as '1' | '2' | '3' | '4' | '5' })
          }}
          className="hidden"
        />
        <label htmlFor={`star-${star}`} className="flex justify-center items-center cursor-pointer">
          <div className="size-10 flex justify-center items-center">
            {itIsColored ? <StarIconReviewColored /> : <StarIconReview />}
          </div>
        </label>
      </div>
    )
  })

  React.useEffect(() => {
    setItIsClient(true)
  }, [])

  if (!itIsClient) {
    return null
  }

  return (
    <div className="w-full max-w-[710px] mx-auto py-6 md:py-10">
      {!isSuccess ? (
        <>
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col gap-s">
              <GenericHeading
                headingType="h4"
                fontStyle="font-sansation font-[700]"
                textColor="text-bordo"
                extraClass=" text-center"
              >
                <h2>Отзив за продуктът</h2>
              </GenericHeading>
            </div>

            <form
              className="w-full flex flex-col gap-m py-4 border-[1px] border-brown/50 rounded-[20px] mt-4 px-2 md:px-6"
              action={submitHandler}
              // encType="multipart/form-data"
            >
              <div className="w-full flex flex-col lg:flex-row gap-m">
                <TextInput
                  name="author"
                  label="Име"
                  formValues={formValues}
                  setFormValues={setFormValues}
                  extraClass="w-full"
                  placeholder="Иван Иванов"
                  required={true}
                  error={errors.author}
                  autoFocus={false}
                />
              </div>

              <div className="w-full">
                <TextArea
                  name="message"
                  label="Bележка към поръчката"
                  formValues={formValues}
                  setFormValues={setFormValues}
                  extraClass="w-full"
                  placeholder={'Имам бележка относно...'}
                  required={true}
                  error={('message' in errors && (errors.message as string)) || ''}
                  autoFocus={false}
                />
              </div>

              <input type="hidden" name="productId" value={productId} />

              <div className="w-full flex items-center gap-2">
                <div className="font-kolka font-[500] text-brown">Рейтинг:</div>
                <div className="w-fit flex items-center justify-between gap-2">{starsInput}</div>
              </div>

              <ReviewImageField name="image" />

              <div className="w-full flex flex-col gap-3 py-4">
                <button
                  className="w-full flex gap-2"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  type="button"
                >
                  <div className="size-4 md:size-5 border-[1px] bg-bordo border-bordo rounded-[4px] flex justify-center items-center">
                    {acceptTerms && <CheckBoxIcon />}
                  </div>
                  <GenericParagraph pType="small" extraClass="text-left">
                    Съгласен с общите условия*
                  </GenericParagraph>
                </button>

                <button
                  className="w-full flex gap-2"
                  onClick={() => setAcceptPrivacy(!acceptPrivacy)}
                  type="button"
                >
                  <div className="size-4 md:size-5 border-[1px] bg-bordo border-bordo rounded-[4px] flex justify-center items-center">
                    {acceptPrivacy && <CheckBoxIcon />}
                  </div>
                  <GenericParagraph pType="small" extraClass="text-left">
                    Съгласен с политиката за поверителност*
                  </GenericParagraph>
                </button>

                <button
                  className="w-full flex gap-2"
                  onClick={() => setAcceptNextContacts(!acceptNextContacts)}
                  type="button"
                >
                  <div className="size-4 md:size-5 border-[1px] bg-bordo border-bordo rounded-[4px] flex justify-center items-center">
                    {acceptNextContacts && <CheckBoxIcon />}
                  </div>
                  <GenericParagraph pType="small" extraClass="text-left">
                    Съгласен отзивът ми да бъде показан на сайтът
                  </GenericParagraph>
                </button>

                <div className="w-full py-2">
                  <button
                    className="w-full rounded-[24px] fle  justify-center items-center red_background py-4 px-4
          [&>div>div>svg]:hover:animate-bounce disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Към поръчка"
                    type="submit"
                    disabled={pending}
                  >
                    <div className="flex justify-center items-center">
                      <GenericParagraph
                        fontStyle="font-sansation font-[700]"
                        pType="small"
                        textColor="text-white"
                        extraClass="uppercase"
                      >
                        {pending ? 'Зареждане...' : 'Изпрати'}
                      </GenericParagraph>

                      <div className="w-[20px] h-[20px] flex justify-center items-center ml-1">
                        <ArrowIcon color="white" />
                      </div>
                    </div>
                  </button>
                </div>

                {error && <ErrorMessageBox error={error} />}
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col gap-s">
            <GenericHeading
              headingType="h4"
              fontStyle="font-sansation font-[700]"
              textColor="text-bordo"
              extraClass="border-b-[1px] border-b-bordo/80 text-center"
            >
              <h2>Благодарим!</h2>
            </GenericHeading>
          </div>

          <GenericParagraph
            fontStyle="font-sansation font-[700]"
            pType="large"
            textColor="text-brown"
            extraClass="text-center py-4 w-full"
          >
            Благодарим за даденото мнение. Вашият отзив е важен за нас. След оглед може да бъде
            видим на сайтът
          </GenericParagraph>
        </div>
      )}
    </div>
  )
}

export default ReviewForm
