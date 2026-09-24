export type NotificationKind = 'attention' | 'handover' | 'update' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: Date
  read: boolean
}
