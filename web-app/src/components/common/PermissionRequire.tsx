import React, { ReactNode } from 'react';
import { useUser } from '../../store/hooks';

interface Props {
  permission: string;
  children: ReactNode;
}

export default function PermissionRequire(props: Props) {
  const user = useUser();
  return (
    <>
      {user.permissions &&
        user.permissions.includes(props.permission) &&
        props.children}
    </>
  );
}
