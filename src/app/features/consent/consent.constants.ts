import type { TncSection } from './consent.model';

export const CONSENT_EVENTS = {
  ACCEPTED: 'User_accepted_AECB',
} as const;

export const BUREAU_CONSENT_INTRO = 'By clicking on the accept button below:';

export const BUREAU_CONSENT_ITEMS = [
  `you authorize Appro to obtain your credit report from the Al Etihad Credit Bureau, and obtain any other source of information such as bank statements from your existing financial institution, for the purposes of assessing your creditworthiness and determining your eligibility for any products, banking services or credit facilities offered on the Appro platform by third party financial institutions ("Third Party Financial Institutions");`,
  `you authorize Appro to disclose and provide such information as may be required under applicable laws and regulations in order for Appro to obtain any such credit report or such other information from any third parties for the purpose set out in point 1 above;`,
  `you authorise Appro to disclose the credit report and such other credit information to the Third Party Financial Institution;`,
  `you authorize the Third Party Financial Institutions, which you have selected to provide you with banking products and services, to obtain a credit report from the Al Etihad Credit Bureau and to obtain bank statements and such other information from your existing financial institution, for the purpose set out in point 1 above; and`,
  `you acknowledge that the consents provided herein shall remain in full force and effect, may be relied on by Third Party Financial Institutions, and may not be terminated or amended without Appro's consent.`,
] as const;

export const TNC_SECTIONS: readonly TncSection[] = [
  {
    heading: 'Marketing Consent',
    paragraphs: ['By clicking on the accept button below:'],
    items: [
      'You consent to Appro, its respective officers, agents, related entities and its affiliates ("Appro" or "us"), in any jurisdiction, to process your personal data including but not limited to your name, email address, telephone number, and any sensitive data you provide to us. We will use your personal data to contact you regarding the products and services we offer, process your requests regarding our products, services and promotions, and for any other purposes required by law;',
      'You give us consent to contact you via email, SMS and phone calls for marketing purposes and any promotional offers that we or our strategic partners may offer. You may always opt out to receive marketing from Appro at a later date; and',
      "You acknowledge that the consents provided herein shall remain in force and effect and may not be terminated or amended without Appro's consent.",
    ],
  },
  {
    heading: 'PIA Statement',
    paragraphs: [
      'I authorize Aladdin to obtain, verify and exchange my information with credit reference bureau and Government database for the interest of testing/market validation of Aladdin.',
    ],
  },
  {
    heading: 'Terms & Conditions',
    paragraphs: [
      'Important: Through the Appro Services you will be applying for financial products and services. There are risks with any financial product or service, and if this results in you borrowing money you need to ensure you do so within your means and that you will be able to make the requirement payments. If in doubt we recommend that you seek independent professional advice.',
    ],
  },
  {
    heading: '1. These Terms and Conditions',
    paragraphs: [
      '1.1 Please read these Terms and Conditions carefully, as they will be legally binding on you when you use the Appro Services. If you do not agree to these Terms and Conditions, you must immediately discontinue your use of the Appro Services.',
      '1.2 In these Terms and Conditions, "you" and "your" refer to a person who applies for, uses or accesses the Appro Services, and "we," "our," and "us" refer to Appro, a business which is owned and operated by Appro Onboarding Solutions FZ-LLC. All capitalised words found in these Terms and Conditions, are defined in the definitions section at the end of this document.',
      "1.3 If you are accessing the Appro Services through the Mobile App, then please note that while these Terms and Conditions shall apply to such use, there may be additional terms (such as the terms imposed by App Store (iOS), Android's (Google) Play Store, Microsoft's store, from time to time), which will govern the use of the Mobile App.",
      '1.4 We reserve the right at any time, at our sole discretion, to change or otherwise modify these Terms and Conditions. When this happens we will give you prior notice. Your continued access or use of the Appro Services signifies your acceptance of our updated or modified Terms and Conditions.',
    ],
  },
  {
    heading: '2. The Appro Services',
    paragraphs: [
      '2.1 Appro is an online Platform which enables you to search, compare and apply for certain financial products and services that are offered by third party Service Providers. If you are a Service Provider, the Appro Platform allows you to offer your products and services to other users of the Platform.',
      '2.2 Appro does not intend to sell, offer or provide, and is neither authorised nor licensed to sell, offer or provide, any financial products or services to you, as such Appro is not regulated by the United Arab Emirates Central Bank. Appro simply acts as an intermediary to connect you with a Service Provider.',
      '2.3 Once you create an Account, you will be asked to upload certain data and information to the Platform, and answer questions relating to the products and/or services you require. We will then assess your data and information, and if you qualify for the products and/or services you have selected, we will match you with certain Service Providers.',
      '2.4 Once we send your data and information to the selected Service Provider, the Service Provider will then conduct a further assessment on the information they have received and decide whether or not to provide you with an in-principle approval for the product and/or service you have applied for.',
    ],
  },
  {
    heading: '3. Registration and Use of the Website',
    paragraphs: [
      '3.1 The Website and Mobile App are freely accessible currently, however, prior to availing any of the Services to you, you will have to register on the Website or Mobile App and create an Account.',
      '3.2 Upon registration for the Appro Services, a "one-time password" (OTP) will be sent to your mobile number and a verification email will be sent to the valid email address provided by you. You will need to enter the OTP for validating your mobile number and verify the email for validating your email address.',
      '3.3 You will also be required to submit supporting documents as requested by us in order for us to verify your identity and provide the relevant Services to you, including but not limited to your identification card, passport, bank statements of specific duration, documents to prove your residential address and photos.',
      '3.4 To the extent permitted under applicable laws, we will also collect documents and information pertaining to you from the records maintained with United Arab Emirates Credit Bureau and such governmental authorities which are required as part of the User Verification process.',
      '3.5 Further details of the information and/or documents that we collect and the manner in which we use the information and/or documents are detailed in our Privacy Notice available on our Website.',
    ],
  },
  {
    heading: '12. Collection, Use and Disclosure of Your Information',
    paragraphs: [
      '12.1 You consent to, and shall procure that all relevant individuals whose information has been disclosed to us by or through you consent to, our officers, employees, agents and advisers collecting, using or disclosing such information relating to you (and the Relevant Individuals) including details of your account information to any third party solely for the purpose of providing you with the Services and as set out in our Privacy Notice, or as is otherwise required or permitted in accordance with applicable law.',
      '12.2 Without affecting the generality of clause 12.1, you hereby acknowledge, agree and consent to the disclosure of your information to (i) the United Arab Emirates credit bureau, and allow us to make enquiries and receive further information about you from the United Arab Emirates credit bureau; and (ii) any Service Providers, at our sole and absolute discretion.',
    ],
  },
  {
    heading: '13. General Provisions',
    paragraphs: [
      '13.1 Complaints and Customer Service — If you have any concern or grievance in respect to any Content, information, or data on the Website or Mobile App or in relation to the Appro Services, please contact us by sending an e-mail to support@appro.ae',
      '13.2 Sub-contracting and Assignment — You acknowledge that, to the extent permitted by law, we may assign, sub-contract, delegate or otherwise transfer the benefit of these Terms and Conditions or any of our obligations under them to another party without your consent.',
      '13.3 Force Majeure — We shall not be liable for any failure or delay to perform any of its obligations if such performance is prevented, hindered or delayed, in part or entirely, by any event beyond our reasonable control, including without limitation, fire, flood, explosion, acts of god, terrorist acts, civil commotion, strikes or industrial action of any kind, riots, insurrection, war, acts of government.',
      '13.4 Governing Law — This Agreement shall be construed, interpreted and applied in accordance with, and shall be governed by, the laws of the Emirate of Dubai and (to the extent applicable) the laws of the United Arab Emirates, and the courts of Dubai shall have exclusive jurisdiction to entertain any dispute or suit arising out of or in relation to this Agreement.',
    ],
  },
];
