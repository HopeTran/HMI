
export const RESET_DATA_FOR_ANONYMOUS = 'RESET_DATA_FOR_ANONYMOUS';

interface ResetDataForAnonymous {
  type: typeof RESET_DATA_FOR_ANONYMOUS;
  payload: any;
}

export type UserActionTypes =
  | ResetDataForAnonymous;
