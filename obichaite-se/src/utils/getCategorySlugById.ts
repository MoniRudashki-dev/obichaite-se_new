const map = {
  '1': 'produkti',
  '2': 'emotsionalni-iznenadi',
  '3': 'tematchni-podarytsi',
  '4': 'rychnoizraboteni-podarytsi',
  '5': 'ekstremni-prezhivyavaniya',
  '6': 'organizirane-na-sybitiya',
}

export function getCategorySlugById(id: number) {
  const keyId = id.toString()

  return map[keyId as keyof typeof map] || null
}
