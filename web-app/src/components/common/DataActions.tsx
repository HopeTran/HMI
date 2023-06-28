import { Button } from 'primereact/button';
interface ActionBodyTemplateProps {
  data: any;
  onEditClick?: (e: any) => void;
  onDeleteClick?: (e: any) => void;
  disabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}

export default function DataActions(props: ActionBodyTemplateProps) {
  const handleEditAction = (e: any) => {
    if (props.onEditClick) {
      props.onEditClick({ data: props.data, event: e });
    }
  };

  const handleDeleteAction = (e: any) => {
    if (props.onDeleteClick) {
      props.onDeleteClick({ data: props.data, event: e });
    }
  };

  return (
    <div className={`${props.disabled ? 'disabled' : ''} d-flex`}>
      {props.onEditClick && !props.editDisabled && (
        <Button icon="pi pi-pencil" onClick={handleEditAction} className="p-button-text p-link" />
      )}
      {props.onDeleteClick && !props.deleteDisabled && (
        <Button icon="pi pi-trash" onClick={handleDeleteAction} className="p-button-text p-link" />
      )}
    </div>
  );
}
