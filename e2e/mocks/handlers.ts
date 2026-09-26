import { http, HttpResponse } from 'msw';

import { APP_ID, mockApplicationResponse } from './data';

export const handlers = [
  // Shared across all buyer flow steps — fetched via ApplicationCacheService
  http.get('/Buyer/Application/:applicationId', () => HttpResponse.json(mockApplicationResponse)),

  // buyer-details: PUT to update applicant data
  http.put('/Buyer/Application/', () =>
    HttpResponse.json({
      success: true,
      data: { applicationId: APP_ID },
      statusCode: 200,
      errorDetails: null,
    })
  ),

  // buyer-details: reference data dropdowns
  http.get('/Buyer/location-emirates', () =>
    HttpResponse.json({
      success: true,
      data: {
        emirates: [
          'Abu Dhabi',
          'Dubai',
          'Sharjah',
          'Ajman',
          'Umm Al Quwain',
          'Ras Al Khaimah',
          'Fujairah',
        ],
      },
    })
  ),

  http.get('/Buyer/working-industry', () =>
    HttpResponse.json({
      success: true,
      data: {
        workingIndustries: [
          { id: '1', code: 'finance', label: 'Finance' },
          { id: '2', code: 'technology', label: 'Technology' },
          { id: '3', code: 'healthcare', label: 'Healthcare' },
        ],
      },
    })
  ),

  http.get('/Buyer/search-company', () =>
    HttpResponse.json({
      success: true,
      data: { companies: ['Acme Corp', 'Tech Solutions', 'Global Finance'] },
    })
  ),

  // buyer-details: validate before EID redirect
  http.get('/Buyer/validate', () =>
    HttpResponse.json({
      success: true,
      data: { isVerified: false },
      statusCode: 200,
      errorDetails: null,
    })
  ),

  // consent step
  http.put('/CustomerPortal/application/consents', () =>
    HttpResponse.json({ success: true, statusCode: 200, errorDetails: null })
  ),

  // KFS step
  http.post('/Buyer/acceptKFS', () =>
    HttpResponse.json({
      success: true,
      data: { status: 'accepted', message: 'KFS accepted successfully' },
      statusCode: 200,
      errorDetails: null,
    })
  ),
];
