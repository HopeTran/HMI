export default class User {
  constructor(initData?: any) {
    if (initData) {
      Object.assign(this, initData);
    }
  }

  _id: string = '';
  firstName: string = '';
  lastName: string = '';
  storeId: number = 0;
  activated: boolean = false;
  address: string = '';
  blacklist: boolean = false;
  country: string = '';
  email: string = '';
  isAdmin: boolean = false;
  status: boolean = false;
  token: string = '';
  expiredDate: Date = new Date();
  type: string = '';
  username: string = '';
  profileImage: string = '';
  lastLoginAt: Date = new Date();
  isTwoFA: boolean = false;
  isInputted2Fa: boolean = false;
  isFromThirdParty: boolean = false;
  shouldSendMailForChangedIpOrDevice: boolean = false;
  roles: any[] = [];
  phoneNumbers: any[] = [];
  permissions: string[] = [];
  hasReferralProgram: boolean = false;
  adminSetting: any;
  language: string = '';
  social: any;
  geoLocation: any;
  searchLocationRadius: number = 10;

  hasPermission(permission: string): boolean {
    return this.permissions && this.permissions.includes(permission);
  }
}
