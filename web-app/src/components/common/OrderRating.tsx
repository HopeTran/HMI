import { Rating } from 'primereact/rating';
import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';

import hmiService from 'services/HomeMadeInn';
import ConfirmationDialog from './ConfirmationDialog';

import successIcon from '../../statics/images/ok-tick.svg';

interface Props {
  orderId: string;
  rating: number;
  storeId: number;
}
export default function OrderRating(props: Props) {
  const [ratingValue, setRatingValue] = useState(props.rating);
  const [confirmRating, setConfirmRating] = useState(false);
  const [unableRating, setUnableRating] = useState(props.rating > 1 ? true : false);

  const id = props.orderId;
  const toast = useRef<any>(null);

  const onHandleDismiss = () => {
    setConfirmRating(false);
  };

  const onHandleConfirm = async () => {
    try {
      await hmiService.updateOrder({
        rating: ratingValue,
        storeId: props.storeId,
        id,
      });
      setConfirmRating(true);
      setUnableRating(!unableRating);
      setTimeout(() => {
        setConfirmRating(false);
      }, 3000);
    } catch (error) {}
  };

  return (
    <>
      <Toast ref={toast} />
      <p className="font-bold">Rating Order</p>
      <div className="d-flex justify-content-between align-items-center">
        <Rating
          value={ratingValue}
          cancel={false}
          readOnly={unableRating}
          onChange={(e: any) => setRatingValue(e.value)}
        />
        {!unableRating && (
          <p className="btn-p-default" onClick={onHandleConfirm}>
            Confirm
          </p>
        )}
      </div>
      <ConfirmationDialog
        visible={confirmRating}
        onHide={onHandleDismiss}
        header="Confirm rating"
        message={`<h4 class="text-center"><img src="${successIcon}" width="50" class="mb-4"/><br/>Thank you for rating</h4>`}
      />
    </>
  );
}
