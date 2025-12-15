const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

const attributeField = (initial: number) =>
  new SchemaField({
    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    value: new NumberField({ required: true, integer: true, min: 0, initial }),
    max: new NumberField({ required: true, integer: true, min: 0, initial }),
  });

const skillField = (initial: number) =>
  new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial, max: 100 }),
    markForImprovement: new BooleanField({ initial: false }),
    defaultValue: new NumberField({ initial }),
  });

const damageType = () =>
  new SchemaField({
    status: new StringField({ initial: 'none', choices: ['none', 'immune', 'vulnerable', 'resistant', 'restored'] }),
    reduction: new StringField({ initial: '' }),
  });

export { attributeField, damageType, skillField };
