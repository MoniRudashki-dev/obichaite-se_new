'use client'

import React, { useCallback, useEffect, useState, useTransition } from 'react'
import {
  GenericHeading,
  GenericParagraph,
  RadioSelectMultiple,
  TextArea,
  TextInput,
} from '../Generic'
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks'
import RadioSelect from '../Generic/RadioSelect'
import { useCheckout } from '@/hooks/useCheckout'
import { priceToBgn } from '@/utils/calculatePriceFromLvToEuro'
import { ArrowIcon, CheckBoxIcon } from '@/assets/icons'
import ErrorMessageBox from '../Generic/ErrorMessage'
import { makeOrder, MakeOrderInput } from '@/action/checkout'
import Link from 'next/link'
import { setNotification } from '@/store/features/notifications'
import {
  clearProducts,
  setCourier,
  setDeliveryKind,
  setNeedToMakeOrder,
  setTryToMakePayment,
  setUserHaveDiscount,
} from '@/store/features/checkout'
import { sendConfirmedOrderEmail, sendNewOrderEmailAction } from '@/action/mail'
import { removeAllProductsFromShoppingCart } from '@/action/products/shoppingCart'
import { createPaymentIntentAction } from '@/Stripe/action'
import { PaymentSection } from '@/Stripe/components'
import EmailInputWithAction from './EmailInputWithActions'
import { Order } from '@/payload-types'
import { PURCHASE } from '@/services/anatilitics'
import { GlobalLoader } from '../Loader'
import RadioSelectCouriers from '../Generic/RadioSelectCouriers'
import { BoxNowWrapper } from '@/BoxNow/components'
import { BoxnowLocker } from '@/BoxNow/types'
import { SpeedyOffice, SpeedySite } from '@/Speedy/types'
import { SpeedyWrapper } from '@/Speedy/components'
import { EcontWrapper } from '@/Econt/components'
import { EcontCity, EcontOffice } from '@/Econt/types'

export type CheckoutFormValues = {
  name: string
  phone: string
  email: string
  courier: 'speedy-dpd' | 'econt' | 'boxnow'
  deliveryKind: 'office' | 'address' | 'automat'
  deliveryTown: string
  deliveryOffice: string
  boxNowOfficeId: string
  paymentMethod: 'cash' | 'card' | 'needBankTransfer'
  message: string
}

const CheckoutForm = ({
  boxNowCities,
  boxNowShipmentPrice,
  econtOfficePrice,
  econtAddressPrice,
  speedyOfficePrice,
  speedyAddressPrice,
  econtCities,
  speedySites,
}: {
  boxNowCities: BoxnowLocker[]
  boxNowShipmentPrice: number
  econtOfficePrice: number
  econtAddressPrice: number
  speedyOfficePrice: number
  speedyAddressPrice: number
  econtCities: {
    id: number
    name: string
  }[]
  speedySites: SpeedySite[]
}) => {
  const [isClient, setIsClient] = useState(false)

  const dispatch = useAppDispatch()
  const { products, needToMakeOrder, userHaveDiscount } = useAppSelector((state) => state.checkout)
  const userId = useAppSelector((state) => state.root.user?.id)
  const user = useAppSelector((state) => state.root.user)
  const { calculateTotalPrice, calculateItemsSubtotal, calculateRemainSum } = useCheckout()
  const discountMultiplier = userHaveDiscount ? 0.9 : 1
  const totalPrice = calculateTotalPrice(discountMultiplier)
  const [pending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [acceptNextContacts, setAcceptNextContacts] = useState(false)

  const checkoutValuesInitialState: CheckoutFormValues = {
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email ?? '',
    phone: user?.phoneNumber ?? '',
    courier: 'boxnow',
    deliveryKind: 'automat',
    deliveryTown: '',
    deliveryOffice: '',
    boxNowOfficeId: '',
    paymentMethod: 'cash',
    message: '',
  }

  const [formValues, setFormValues] = useState(checkoutValuesInitialState)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryTown: '',
    deliveryOffice: '',
  })

  const remain = Number(calculateRemainSum().toFixed(2))

  const getCurrentShipmentPrice = () => {
    if (formValues.courier === 'boxnow') return boxNowShipmentPrice
    if (formValues.courier === 'econt') {
      return formValues.deliveryKind === 'address' ? econtAddressPrice : econtOfficePrice
    }
    if (formValues.courier === 'speedy-dpd') {
      return formValues.deliveryKind === 'address' ? speedyAddressPrice : speedyOfficePrice
    }
    return 0
  }

  const currentShipmentPrice = getCurrentShipmentPrice()

  // Delivery is free once the items subtotal reaches the free-shipping threshold.
  const isFreeShipping = calculateItemsSubtotal() >= 50
  const displayShipmentPrice = isFreeShipping ? 0 : currentShipmentPrice

  const deliveryKindOptions =
    formValues.courier === 'boxnow'
      ? [{ label: 'Автомат', value: 'automat' }]
      : [
          { label: 'Офис', value: 'office' },
          { label: 'Адрес', value: 'address' },
        ]

  // Keep the Redux checkout slice in sync with the local form so price
  // calculations in useCheckout/PaymentSection reflect the current selection.
  useEffect(() => {
    const reduxCourier = formValues.courier === 'speedy-dpd' ? 'speedy' : formValues.courier
    dispatch(setCourier(reduxCourier as 'econt' | 'speedy' | 'boxnow'))
  }, [formValues.courier, dispatch])

  useEffect(() => {
    dispatch(setDeliveryKind(formValues.deliveryKind))
  }, [formValues.deliveryKind, dispatch])

  const submitHandler = async () => {
    setError('')

    const nameError = formValues.name.length < 3 ? 'Името трябва да е поне 3 символа' : ''
    const phoneError = formValues.phone.length < 10 ? 'Телефонът трябва да поне 10 символа' : ''
    const emailError =
      !formValues.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formValues.email)
        ? 'Въведете валиден имейл'
        : ''
    const deliveryTownError =
      formValues.deliveryTown.length < 3 ? 'Населено място трябва да е поне 3 символа' : ''
    const deliveryOfficeError =
      formValues.deliveryOffice.length < 3 ? 'Полето трябва да е коректно попълнено' : ''

    const hasFieldError =
      !!nameError || !!phoneError || !!emailError || !!deliveryTownError || !!deliveryOfficeError
    const termsMissing = !acceptTerms || !acceptPrivacy

    if (hasFieldError || termsMissing) {
      setErrors({
        name: nameError,
        email: emailError,
        phone: phoneError,
        deliveryTown: deliveryTownError,
        deliveryOffice: deliveryOfficeError,
      })

      // The deliveryTown/deliveryOffice inputs are hidden (location comes from the
      // courier widgets), so surface their errors — and the terms requirement — in
      // the shared error box below the submit button.
      const messages: string[] = []
      if (deliveryTownError || deliveryOfficeError) {
        messages.push('Моля, изберете населено място и офис/адрес за доставка.')
      }
      if (termsMissing) {
        messages.push(
          'Трябва да се съгласите с задължителните условия, за потвърждаване на поръчката.',
        )
      }
      if (messages.length) setError(messages.join(' '))

      return
    }

    if (formValues.paymentMethod === 'card') {
      dispatch(setTryToMakePayment(true))
    } else {
      dispatch(setNeedToMakeOrder(true))
    }
  }

  useEffect(() => {
    if (!needToMakeOrder) return

    let correctPaymentStatus: Order['paymentStatus'] = 'unpaid'
    if (formValues.paymentMethod === 'card') {
      correctPaymentStatus = 'paid'
    }
    if (formValues.paymentMethod === 'needBankTransfer') {
      correctPaymentStatus = 'needBankTransfer'
    }

    const shouldChargeShipping = !!currentShipmentPrice && calculateItemsSubtotal() < 50

    const requestBody: MakeOrderInput = {
      items: products,
      customerName: formValues.name,
      customerEmail: formValues.email,
      customerPhone: formValues.phone,
      deliveryMethod: formValues.courier,
      shippingAddress: {
        line1: formValues.deliveryOffice,
        city: formValues.deliveryTown,
        postalCode: '',
      },
      paymentStatus: correctPaymentStatus as 'paid' | 'unpaid' | 'refunded',
      clientNotes: formValues.message,
      ...(formValues.courier === 'boxnow' && {
        boxNowOfficeId: formValues.boxNowOfficeId,
      }),
      ...(shouldChargeShipping && { shippingPrice: currentShipmentPrice }),
    }

    startTransition(async () => {
      const response = await makeOrder(requestBody, userId as number | null, userHaveDiscount)

      if (response.ok) {
        setOrderNumber(response.orderNumber as string)
        setIsSuccess(true)
        dispatch(
          setNotification({ showNotification: true, message: 'Успешна поръчка', type: 'success' }),
        )
        if (response.orderId) {
          sendNewOrderEmailAction({
            orderId: response.orderId,
            items: products.map((item) => {
              return {
                name: item.title,
                quantity: item.orderQuantity,
              }
            }),
            total: Number(calculateTotalPrice(discountMultiplier).toFixed(2)),
          })
          sendConfirmedOrderEmail({
            orderId: response.orderId,
            items: products.map((item) => {
              return {
                name: item.title,
                quantity: item.orderQuantity,
              }
            }),
            total: Number(calculateTotalPrice(discountMultiplier).toFixed(2)),
            userName: formValues.name as string,
            userEmail: formValues.email as string,
            orderNumber: response.orderNumber as string,
          })

          // purchase trigger
          PURCHASE(
            'EUR',
            String(calculateTotalPrice(discountMultiplier).toFixed(2)),
            response.orderNumber as string,
            products.map((product) => {
              return {
                item_id: String(product?.id),
                item_name: product?.title,
                price: product.promoPriceInEuro
                  ? product.promoPriceInEuro
                  : product.priceInEuro || 0,
                quantity: product.orderQuantity,
              }
            }),
          )
        }
        dispatch(clearProducts())
        dispatch(setUserHaveDiscount(false))
        if (!userId) {
          localStorage.removeItem('cardProductsObichaiteSe')
        } else {
          removeAllProductsFromShoppingCart(userId)
        }
      } else {
        setError('Неуспешна поръчка, моля опитайте по-късно')
      }
    })
    dispatch(setNeedToMakeOrder(false))
  }, [needToMakeOrder])

  useEffect(() => {
    setIsClient(true)
  }, [])

  let paymentInfoText = 'Наложен платеж'
  if (formValues.paymentMethod === 'card') {
    paymentInfoText = 'Вашата поръчка е заплатена успешно'
  }
  if (formValues.paymentMethod === 'needBankTransfer') {
    paymentInfoText = `Банков транфер, ще получите проформа фактура на посочения имейл адрес, по която да извършите плащане. Не правете плашане без да сте получили проформата. В графата "Основание за плащане" ЗАДЪЛЖИТЕЛНО трябва да попълните номер на проформата фактура. Ако не сте попълнили номер за индетификацията на превода да се затроднява обработката на поръчката и е възможно тя да не бъде активирана, тъй като няма да знаем за какво е плащането. Ако имате някакви въпроси относно направената от Вас поръчка, ще се радваме да ви помогнем.`
  }

  const paymentOptions =
    totalPrice > 0
      ? [
          { label: 'Наложен платеж', value: 'cash' },
          { label: 'Кредитна/дебитна карта', value: 'card' },
          { label: 'Плащане по банков път', value: 'needBankTransfer' },
        ]
      : [
          { label: 'Наложен платеж', value: 'cash' },
          { label: 'Плащане по банков път', value: 'needBankTransfer' },
        ]

  const currentBoxNowCity = formValues.boxNowOfficeId
    ? ({ id: formValues.boxNowOfficeId, name: formValues.deliveryTown } as BoxnowLocker)
    : null
  const currentShippingCity =
    speedySites.find((site) => site.name === formValues.deliveryTown) ?? null
  const currentEcontShippingCity =
    econtCities.find((city) => city.name === formValues.deliveryTown) ?? null
  const chosenOffice: SpeedyOffice | null = null
  const chosenEcontOffice: EcontOffice | null = null

  const handleBoxNowCityChange = useCallback((city: BoxnowLocker) => {
    setFormValues((prev) => ({
      ...prev,
      deliveryTown: city.name,
      deliveryOffice: city.name,
      boxNowOfficeId: city.id,
    }))
  }, [])

  const handleBoxNowOfficeChange = useCallback((office: BoxnowLocker) => {
    setFormValues((prev) => ({
      ...prev,
      deliveryTown: office.name,
      deliveryOffice: office.name,
      boxNowOfficeId: office.id,
    }))
  }, [])

  const handleCityChange = useCallback(
    (city: SpeedySite) => {
      const selectedSite = speedySites.find((site) => site.id === city.id) ?? city

      setFormValues((prev) => ({
        ...prev,
        deliveryTown: selectedSite.name,
        deliveryOffice: prev.deliveryKind === 'office' ? selectedSite.name : prev.deliveryOffice,
        boxNowOfficeId: '',
      }))
    },
    [speedySites],
  )

  const handleOfficeChange = useCallback(
    (office: SpeedyOffice) => {
      setFormValues((prev) => ({
        ...prev,
        deliveryTown:
          speedySites.find((site) => site.id === office.siteId)?.name ?? prev.deliveryTown,
        deliveryOffice: office.name,
        boxNowOfficeId: '',
      }))
    },
    [speedySites],
  )

  const handleAddressChange = useCallback((address: string) => {
    setFormValues((prev) => ({
      ...prev,
      deliveryOffice: address,
      boxNowOfficeId: '',
    }))
  }, [])

  const handleEcontCityChange = useCallback(
    (city: EcontCity) => {
      const selectedCity = econtCities.find((econtCity) => econtCity.id === city.id) ?? city

      setFormValues((prev) => ({
        ...prev,
        deliveryTown: selectedCity.name,
        deliveryOffice: prev.deliveryKind === 'office' ? selectedCity.name : prev.deliveryOffice,
        boxNowOfficeId: '',
      }))
    },
    [econtCities],
  )

  const handleEcontOfficeChange = useCallback(
    (office: EcontOffice) => {
      setFormValues((prev) => ({
        ...prev,
        deliveryTown:
          econtCities.find((city) => city.id === office.cityId)?.name ?? prev.deliveryTown,
        deliveryOffice: office.name,
        boxNowOfficeId: '',
      }))
    },
    [econtCities],
  )

  const handleEcontAddressChange = useCallback((address: string) => {
    setFormValues((prev) => ({
      ...prev,
      deliveryOffice: address,
      boxNowOfficeId: '',
    }))
  }, [])

  //Add client guard and loader to avoid hydration error
  if (!isClient) {
    return (
      <div className="fixed inset-0 z-[20] bg-brown min-h-screen">
        <GlobalLoader color={'#FFFFFF'} />
      </div>
    )
  }

  return (
    <>
      {!isSuccess ? (
        <>
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-col gap-s">
              <GenericHeading
                headingType="h4"
                fontStyle="font-sansation font-[700]"
                textColor="text-bordo"
                extraClass="border-b-[1px] border-b-bordo/80 text-center"
              >
                <h2>Поръчка детайли</h2>
              </GenericHeading>
            </div>

            {products?.length === 0 ? (
              <>
                <GenericHeading
                  headingType="h5"
                  fontStyle="font-sansation font-[700]"
                  textColor="text-bordo"
                  extraClass="text-center pt-6"
                >
                  <h2>За да финализирате поръчката трябва да добавите продукти</h2>
                </GenericHeading>
              </>
            ) : (
              <form className="w-full flex flex-col gap-m py-4">
                <div className="w-full flex flex-col lg:flex-row gap-m">
                  <TextInput
                    name="name"
                    label="Име и Фамилия"
                    formValues={formValues}
                    setFormValues={setFormValues}
                    extraClass="w-full"
                    placeholder="Иван Иванов"
                    required={true}
                    error={errors.name}
                    autoFocus={false}
                  />
                  <TextInput
                    name="phone"
                    label="Tелефон"
                    formValues={formValues}
                    setFormValues={setFormValues}
                    extraClass="w-full"
                    placeholder="+359888888888"
                    required={true}
                    error={errors.phone}
                    autoFocus={false}
                  />
                </div>

                <div className="w-full">
                  <EmailInputWithAction
                    name="email"
                    label="Емейл"
                    formValues={formValues}
                    setFormValues={setFormValues}
                    extraClass="w-full"
                    placeholder="ivan.ivanov@gmail.com"
                    required={true}
                    error={errors.email}
                    autoFocus={false}
                  />
                </div>

                <div className="w-full">
                  <RadioSelectCouriers
                    options={[
                      { label: 'Speedy', value: 'speedy-dpd' },
                      { label: 'Econt', value: 'econt' },
                      { label: 'BoxNow', value: 'boxnow' },
                    ]}
                    label="Куриер"
                    formValues={formValues}
                    setFormValues={setFormValues}
                    name="courier"
                    required={true}
                  />
                </div>

                <div className="w-full">
                  <RadioSelect
                    options={deliveryKindOptions}
                    label="Вид Доставка"
                    formValues={formValues}
                    setFormValues={setFormValues}
                    name="deliveryKind"
                    required={true}
                  />

                  <GenericParagraph
                    fontStyle="font-kolka font-[500]"
                    textColor="text-brown"
                    pType="small"
                    extraClass="text-center mt-2"
                  >
                    {displayShipmentPrice === 0
                      ? 'Безплатна доставка'
                      : `Цена за доставка: ${displayShipmentPrice.toFixed(2)} €`}
                  </GenericParagraph>
                </div>

                {formValues.courier === 'boxnow' && (
                  <div className="w-full py-3 md:px-4 md:py-3 bg-white">
                    <GenericParagraph
                      fontStyle="font-sansation font-[400]"
                      textColor="text-brown"
                      extraClass="text-center mb-3"
                    >
                      Изберете BoxNow Автомат
                    </GenericParagraph>
                    <BoxNowWrapper
                      activeInnerShipping={formValues.courier}
                      currentShippingCity={currentBoxNowCity}
                      handleCityChange={handleBoxNowCityChange}
                      handleOfficeChange={handleBoxNowOfficeChange}
                      office={null}
                      boxNowCities={boxNowCities}
                    />
                  </div>
                )}

                {formValues.courier === 'speedy-dpd' && (
                  <div className="w-full py-3 md:px-4 md:py-3 bg-white">
                    <GenericParagraph
                      fontStyle="font-sansation font-[400]"
                      textColor="text-brown"
                      extraClass="text-center mb-3"
                    >
                      Speedy
                    </GenericParagraph>
                    <SpeedyWrapper
                      activeInnerShipping={
                        formValues.deliveryKind === 'office' ? 'speedy-office' : 'speedy-address'
                      }
                      address={formValues.deliveryOffice}
                      currentShippingCity={currentShippingCity}
                      handleAddressChange={handleAddressChange}
                      handleCityChange={handleCityChange}
                      handleOfficeChange={handleOfficeChange}
                      office={chosenOffice}
                      speedySites={speedySites}
                    />
                  </div>
                )}

                {formValues.courier === 'econt' && (
                  <div className="w-full py-3 md:px-4 md:py-3 bg-white">
                    <GenericParagraph
                      fontStyle="font-sansation font-[400]"
                      textColor="text-brown"
                      extraClass="text-center mb-3"
                    >
                      Econt
                    </GenericParagraph>
                    <EcontWrapper
                      activeInnerShipping={
                        formValues.deliveryKind === 'office' ? 'econt-office' : 'econt-address'
                      }
                      address={formValues.deliveryOffice}
                      currentShippingCity={currentEcontShippingCity}
                      handleAddressChange={handleEcontAddressChange}
                      handleCityChange={handleEcontCityChange}
                      handleOfficeChange={handleEcontOfficeChange}
                      office={chosenEcontOffice}
                      econtCities={econtCities}
                    />
                  </div>
                )}

                <div className="w-full flex flex-col gap-m">
                  <div className="hidden">
                    <TextInput
                      name="deliveryTown"
                      label="Град/Село"
                      formValues={formValues}
                      setFormValues={setFormValues}
                      extraClass="w-full"
                      placeholder="София..."
                      required={true}
                      error={errors.deliveryTown}
                      autoFocus={false}
                    />
                  </div>

                  <div className={`hidden`}>
                    <TextInput
                      name="deliveryOffice"
                      label={formValues.deliveryKind === 'office' ? '"Офис (име/код)"' : 'Адрес'}
                      formValues={formValues}
                      setFormValues={setFormValues}
                      extraClass="w-full"
                      placeholder={
                        formValues.deliveryKind === 'office'
                          ? '"Централен офис.../931522..."'
                          : 'Град София, ЖК Младост бл. 331...'
                      }
                      required={true}
                      error={errors.deliveryOffice}
                      autoFocus={false}
                    />
                  </div>
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

                <div className="w-full flex justify-center items-center bg-brown/80 py-4">
                  <GenericParagraph
                    fontStyle="font-kolka font-[500]"
                    pType="small"
                    textColor="text-white"
                    extraClass="px-1 text-center"
                  >
                    {remain < 0 ? (
                      <span className="uppercase">Доставката е безплатна!</span>
                    ) : (
                      <>
                        {currentShipmentPrice === 0 ? (
                          'Безплатна доставка'
                        ) : (
                          <>
                            {`Добави артикули за още ${calculateRemainSum().toFixed(2)} euro и доставката
                        ще е безплатна`}
                          </>
                        )}
                      </>
                    )}
                  </GenericParagraph>
                </div>
                <div className="w-full flex flex-col gap-3 py-4">
                  {userHaveDiscount && <div>* Вие получавате -10% отстъпка от крайната цена!.</div>}
                  <div className="w-full flex justify-between items-center border-[1px] border-bordo   bg-bordo px-2 py-4">
                    <GenericParagraph textColor="text-white" extraClass="font-[700]">
                      Сума всичко:{' '}
                    </GenericParagraph>

                    <GenericParagraph
                      fontStyle="font-kolka font-[500]"
                      pType="small"
                      textColor="text-white"
                    >
                      {totalPrice.toFixed(2)}€ ({priceToBgn(totalPrice)} лв)
                    </GenericParagraph>
                  </div>

                  <div>
                    <GenericParagraph pType="small">
                      Цените са с ДДС (ако е приложимо).
                    </GenericParagraph>
                  </div>

                  <div className="w-full">
                    <RadioSelectMultiple
                      options={paymentOptions}
                      label="Начин на плащане"
                      formValues={formValues}
                      setFormValues={setFormValues}
                      name="paymentMethod"
                      required={true}
                    />
                  </div>

                  {formValues.paymentMethod === 'card' && (
                    <div className="w-full">
                      <PaymentSection
                        items={products}
                        createPaymentIntentAction={createPaymentIntentAction}
                      />
                    </div>
                  )}

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
                      Съгласен с последващите контакти (опционално)
                    </GenericParagraph>
                  </button>

                  <div className="w-full py-2">
                    <button
                      className="w-full rounded-[24px] fle  justify-center items-center red_background py-4 px-4
          [&>div>div>svg]:hover:animate-bounce disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Към поръчка"
                      type="button"
                      onClick={() => submitHandler()}
                      disabled={products.length === 0 || pending}
                    >
                      <div className="flex justify-center items-center">
                        <GenericParagraph
                          fontStyle="font-sansation font-[700]"
                          pType="small"
                          textColor="text-white"
                          extraClass="uppercase"
                        >
                          {pending ? 'Зареждане...' : 'Завърши поръчката'}
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
            )}
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
              <h2>Доставка</h2>
            </GenericHeading>
          </div>

          <GenericParagraph
            fontStyle="font-sansation font-[700]"
            pType="large"
            textColor="text-brown"
            extraClass="text-center py-4 w-full"
          >
            Вашата поръчка е приета! <br /> Номер на поръчка {orderNumber} Благодарим ви за изборът!{' '}
            <br />
            Плащане: {paymentInfoText}
            <br />
            Ще получите съобщение по email за статуса на поръчката.
            {userId && (
              <span>
                Можете да следите статуса на поръчката в{' '}
                <Link href={`/user-profile?userId=${userId}`} className="text-bordo">
                  Потребителки профил
                </Link>
                .
              </span>
            )}
          </GenericParagraph>
        </div>
      )}
    </>
  )
}

export default CheckoutForm
