import hmiService from 'services/HomeMadeInn';
import { useUser } from 'store/hooks';

import favoriteIcon from 'statics/images/icons/favorite.svg';
import unfavoriteIcon from 'statics/images/icons/un-favorite.svg';

import './FavoriteButton.scss';

interface FavoriteProps {
  store: any;
  onFavoriteChange: (value: boolean) => void;
}

export default function FavoriteButton({ store, onFavoriteChange }: FavoriteProps) {
  const user = useUser();

  const handleFavoriteClick = async (e: any) => {
    try {
      if (store.isFavorite) {
        await hmiService.removeFavoriteStore(store.id);
      } else {
        await hmiService.addFavoriteStore(store.id);
      }
      onFavoriteChange(!store.isFavorite);
    } catch (err) {
    } finally {
      return false;
    }
  };

  return (
    <>
      {user.token ? (
        <span id="favorite" className={`favorite ${store.isFavorite ? 'active' : ''}`} onClick={handleFavoriteClick}>
          {store.isFavorite ? (
            <img id="favorite" src={favoriteIcon} alt="favoriteIcon" />
          ) : (
            <img id="favorite" src={unfavoriteIcon} alt="unfavoriteIcon" />
          )}
        </span>
      ) : null}
    </>
  );
}
