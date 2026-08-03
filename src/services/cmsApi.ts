import { CMSContent } from '../types';
import { apiRequest, jsonRequest } from './api';

export const cmsApi = {
  getCMS: () => apiRequest<CMSContent>('/cms'),
  updateCMS: (cms: CMSContent) => jsonRequest<CMSContent>('/cms', 'PUT', cms),
};

