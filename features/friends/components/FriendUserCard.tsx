import type { ReactElement, ReactNode } from 'react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Card, CardContent } from '@/shared/components/ui/card';

interface IFriendUserCardProps {
  name: string;
  username: string;
  email: string;
  meta?: string;
  imageUrl?: string | null;
  actions?: ReactNode;
  actionsPosition?: 'top' | 'bottom';
}

export function FriendUserCard({
  name,
  username,
  email,
  meta,
  imageUrl,
  actions,
  actionsPosition = 'top',
}: IFriendUserCardProps): ReactElement {
  const classFlex = actionsPosition === 'top' ? 'sm:flex-row-reverse' : 'sm:flex-row'
  return (
    <Card className='w-full py-4'>
      <CardContent className={`flex flex-col gap-4 ${classFlex} sm:items-center sm:justify-between`}>
        {actionsPosition === 'top' && actions ? (
          <div className='flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end'>
            {actions}
          </div>
        ) : null}
        <div className='flex min-w-0 items-start gap-3'>
          <UserAvatar name={name} imageUrl={imageUrl} />
          <div className='min-w-0 flex-1'>
            <p className='truncate font-medium'>{name}</p>
            <p className='truncate text-sm text-muted-foreground'>
              @{username}
            </p>
            <p className='truncate text-sm text-muted-foreground'>{email}</p>
            {meta ? (
              <p className='mt-1 text-xs text-muted-foreground'>{meta}</p>
            ) : null}
          </div>
        </div>
        {actionsPosition === 'bottom' && actions ? (
          <div className='flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end'>
            {actions}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
