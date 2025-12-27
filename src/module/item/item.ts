export default class KerNethalasItem extends Item {
  constructor(data: Item.CreateData, context?: Item.ConstructionContext) {
    const newData = data;
    if (newData.type === 'weapon' && !newData.img) {
      newData.img = 'icons/svg/sword.svg';
    }
    super(newData, context);
  }
}
