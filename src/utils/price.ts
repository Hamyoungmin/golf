// 가격/배송비 계산 유틸

export interface ShippingConfig {
	baseShippingCost: number;
	freeShippingThreshold: number;
}

export interface LineItemLike {
	price: number;
	quantity: number;
}

export function getItemsTotal(items: LineItemLike[]): number {
	return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function getShippingFee(itemsTotal: number, shipping: ShippingConfig): number {
	return itemsTotal >= shipping.freeShippingThreshold ? 0 : shipping.baseShippingCost;
}

export function getFinalTotal(itemsTotal: number, shippingFee: number): number {
	return itemsTotal + shippingFee;
}

export function calculateTotals(items: LineItemLike[], shipping: ShippingConfig) {
	const itemsTotal = getItemsTotal(items);
	const shippingFee = getShippingFee(itemsTotal, shipping);
	const finalTotal = getFinalTotal(itemsTotal, shippingFee);
	return { itemsTotal, shippingFee, finalTotal };
}


