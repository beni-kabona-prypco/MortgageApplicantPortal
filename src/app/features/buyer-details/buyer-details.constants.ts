import type { DropdownItem } from '@prypco/web-ui';

import type { BuyerDetailsFormFields } from './buyer-details.model';

export const MONTHS: readonly DropdownItem[] = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const;

export const BUYER_DETAILS_EVENTS = {
  FORM_SUBMITTED: 'User_Submitted_details',
} as const;

export const EMPTY_FORM: BuyerDetailsFormFields = {
  email: '',
  businessEmail: '',
  salary: '',
  companyName: '',
  workingIndustry: '',
  joiningMonth: '',
  joiningYear: '',
  homeAddress: '',
  villaOrApartmentNumber: '',
  buildingOrCommunity: '',
  area: '',
  emirate: '',
  annualRentalIncome: '',
  annualBonus: '',
  annualCommission: '',
  housingRentalAllowance: '',
  annualVariableAllowance: '',
  lifestyleExpenses: '',
  nonBankingBorrowing: '',
};
