export const vetInvitationSubject = 'An invitation to join My Vet'

export const vetInvitationBody = [
  'Hello,',
  'As a pet owner, I would love to see your practice on My Vet, a UK veterinary directory where owners can find, compare and review veterinary practices.',
  'Would you consider joining? You can create a vet-practice account here:',
  'https://my-vet.co.uk/register?role=vet',
  'It would be great to be able to find your practice and share my experience on the platform.',
  'Thank you!',
].join('\r\n\r\n')

export const vetInvitationMailto = `mailto:?subject=${encodeURIComponent(vetInvitationSubject)}&body=${encodeURIComponent(vetInvitationBody)}`
