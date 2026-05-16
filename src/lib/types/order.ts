export type DeliveryType = 'home' | 'desk';

export interface CreateOrderItemInput {
  id: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shipping: {
    fullName: string;
    phone: string;
    wilayaId: number;
    deliveryType: DeliveryType;
    addressLine1?: string;
    notes?: string;
  };
}
