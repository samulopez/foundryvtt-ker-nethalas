import { SORTING } from '../../constants';

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

const attributeField = (initial: number) =>
  new SchemaField({
    min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    value: new NumberField({ required: true, integer: true, min: 0, initial }),
    max: new NumberField({ required: true, integer: true, min: 0, initial }),
  });

const skillField = (initial: number) =>
  new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial, max: 80 }),
    markForImprovement: new BooleanField({ initial: false }),
    defaultValue: new NumberField({ initial }),
    temporaryModifier: new NumberField({ integer: true }),
  });

const damageType = () =>
  new SchemaField({
    status: new StringField({ initial: 'none', choices: ['none', 'immune', 'vulnerable', 'resistant', 'restored'] }),
    reduction: new StringField({ initial: '' }),
  });

export const sortingField = () => ({
  sorting: new StringField({
    choices: [SORTING.alphabetically, SORTING.manually],
    initial: SORTING.manually,
  }),
});

export { attributeField, damageType, skillField };
