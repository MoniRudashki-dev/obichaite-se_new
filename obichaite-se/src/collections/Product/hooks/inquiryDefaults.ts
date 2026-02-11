export const getDefaultInquiryQuestions = () =>
  DEFAULT_INQUIRY_QUESTIONS.map((question) => ({
    ...question,
    options: question.options?.map((o) => ({ ...o })),
  }))

export const DEFAULT_INQUIRY_QUESTIONS = [
  {
    title: 'За какъв повод е изненадата?',
    type: 'select',
    required: true,
    options: [
      { label: 'Рожден ден', value: 'birthday' },
      { label: 'Годишнина', value: 'anniversary' },
      { label: 'Предложение за брак', value: 'proposal' },
      { label: 'Извинение', value: 'apology' },
      { label: 'Просто „обичам те“', value: 'love' },
      { label: 'Друго', value: 'other' },
    ],
  },
  {
    title: 'В кой град ще се случи изненадата?',
    type: 'text',
    required: true,
    placeholder: 'София, Пловдив, Варна...',
  },
  {
    title: 'За коя дата (и приблизителен час)?',
    type: 'date_text',
    required: true,
    placeholder: 'Ако не е фиксирано – напиши „гъвкаво“',
  },
  {
    title: 'За кого е изненадата?',
    type: 'text',
    required: true,
    placeholder: 'Жена / мъж / възраст (по желание)',
  },
  {
    title: 'Къде предпочитате да се случи изненадата?',
    type: 'select',
    required: true,
    options: [
      { label: 'В дома (апартамент / къща)', value: 'home' },
      { label: 'В ресторант', value: 'restaurant' },
      { label: 'В хотел', value: 'hotel' },
      { label: 'На открито (парк, плаж, панорама и др.)', value: 'outdoor' },
      { label: 'Изненада на работното място', value: 'workplace' },
      { label: 'Все още не съм решил/а – очаквам предложение', value: 'need_suggestion' },
      { label: 'Друго (ще опиша)', value: 'other' },
    ],
  },
  {
    title: 'Имаш ли ориентировъчен бюджет? (по избор)',
    type: 'select',
    required: false,
    options: [
      { label: 'До 100 лв', value: 'up_to_100' },
      { label: '100 – 200 лв', value: '100_200' },
      { label: '200 – 400 лв', value: '200_400' },
      { label: 'Над 400 лв', value: 'over_400' },
      { label: 'Не знам / искам предложение', value: 'unknown' },
    ],
  },
]
