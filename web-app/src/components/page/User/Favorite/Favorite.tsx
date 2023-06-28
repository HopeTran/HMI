import SidebarMenu from 'components/common/SidebarMenu';
import FavoriteStores from './FavoriteStores';

export default function Favorite() {
  return (
    <div className="d-lg-flex user-manager">
      <div className="col-lg-2 px-0 px-lg-2">
        <SidebarMenu />
      </div>
      <div className={`user-manager-body w-100`}>
        <div className="w-100 bg-white p-2">
          <FavoriteStores />
        </div>
      </div>
    </div>
  );
}
