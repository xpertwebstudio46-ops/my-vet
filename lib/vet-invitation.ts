export const vetInvitationSubject = 'An invitation to join My Vet'

export const vetInvitationBody = [
  'Hello,',
  "I've recently joined My Vet (www.my-vet.co.uk) and as a pet owner myself I'd love to see your practice featured on the site",
  'Would you consider joining? You can create a vet-practice account here:',
  'https://my-vet.co.uk/register?role=vet',
  'My Vet is a UK veterinary directory that helps pet owners find, compare and review veterinary practices, making it easier for them to connect with trusted local vets and for Vet owners it helps with transparency inline with the CMA report.',
   'Would you consider joining? You can create your practice profile here:',
   'It would be wonderful to be able to find your practice on the platform and share my own positive experience with other pet owners.',
    'Thank you for your time, and I hope to see you on My Vet soon.',
  'Best wishes',
].join('\r\n\r\n')

export const vetInvitationMailto = `mailto:?subject=${encodeURIComponent(vetInvitationSubject)}&body=${encodeURIComponent(vetInvitationBody)}`

export const vetInvitationGmail = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(vetInvitationSubject)}&body=${encodeURIComponent(vetInvitationBody)}`
