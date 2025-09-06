import {
  evaluateVisibleIf,
  createEqualsCondition,
  createAndCondition,
  createOrCondition,
  exampleConditions
} from '../conditionalLogic';

describe('Conditional Logic', () => {
  describe('evaluateVisibleIf', () => {
    const mockFormValues = {
      getriebe: 'automatik',
      fahrzeugtyp: 'auto',
      zustand: 'neu',
      preis: 5000,
      extras: ['klimaanlage', 'navigationssystem']
    };

    test('returns true for empty or undefined visible_if', () => {
      expect(evaluateVisibleIf('', mockFormValues)).toBe(true);
      expect(evaluateVisibleIf(undefined as any, mockFormValues)).toBe(true);
      expect(evaluateVisibleIf('   ', mockFormValues)).toBe(true);
    });

    test('handles simple equals condition', () => {
      const condition = JSON.stringify(createEqualsCondition('getriebe', 'automatik'));
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseCondition = JSON.stringify(createEqualsCondition('getriebe', 'schaltung'));
      expect(evaluateVisibleIf(falseCondition, mockFormValues)).toBe(false);
    });

    test('handles not_equals condition', () => {
      const condition = JSON.stringify({
        field: 'getriebe',
        operator: 'not_equals',
        value: 'schaltung'
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
    });

    test('handles contains condition for arrays', () => {
      const condition = JSON.stringify({
        field: 'extras',
        operator: 'contains',
        value: 'klimaanlage'
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseCondition = JSON.stringify({
        field: 'extras',
        operator: 'contains',
        value: 'ledersitze'
      });
      expect(evaluateVisibleIf(falseCondition, mockFormValues)).toBe(false);
    });

    test('handles contains condition for strings', () => {
      const condition = JSON.stringify({
        field: 'getriebe',
        operator: 'contains',
        value: 'auto'
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
    });

    test('handles not_contains condition', () => {
      const condition = JSON.stringify({
        field: 'extras',
        operator: 'not_contains',
        value: 'ledersitze'
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
    });

    test('handles greater_than condition', () => {
      const condition = JSON.stringify({
        field: 'preis',
        operator: 'greater_than',
        value: 3000
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseCondition = JSON.stringify({
        field: 'preis',
        operator: 'greater_than',
        value: 10000
      });
      expect(evaluateVisibleIf(falseCondition, mockFormValues)).toBe(false);
    });

    test('handles less_than condition', () => {
      const condition = JSON.stringify({
        field: 'preis',
        operator: 'less_than',
        value: 10000
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
    });

    test('handles is_empty condition', () => {
      const condition = JSON.stringify({
        field: 'nicht_vorhanden',
        operator: 'is_empty'
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseCondition = JSON.stringify({
        field: 'getriebe',
        operator: 'is_empty'
      });
      expect(evaluateVisibleIf(falseCondition, mockFormValues)).toBe(false);
    });

    test('handles is_not_empty condition', () => {
      const condition = JSON.stringify({
        field: 'getriebe',
        operator: 'is_not_empty'
      });
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
    });

    test('handles AND condition group', () => {
      const condition = JSON.stringify(createAndCondition(
        createEqualsCondition('fahrzeugtyp', 'auto'),
        createEqualsCondition('getriebe', 'automatik')
      ));
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseCondition = JSON.stringify(createAndCondition(
        createEqualsCondition('fahrzeugtyp', 'auto'),
        createEqualsCondition('getriebe', 'schaltung')
      ));
      expect(evaluateVisibleIf(falseCondition, mockFormValues)).toBe(false);
    });

    test('handles OR condition group', () => {
      const condition = JSON.stringify(createOrCondition(
        createEqualsCondition('zustand', 'neu'),
        createEqualsCondition('zustand', 'gebraucht')
      ));
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseCondition = JSON.stringify(createOrCondition(
        createEqualsCondition('zustand', 'gebraucht'),
        createEqualsCondition('zustand', 'defekt')
      ));
      expect(evaluateVisibleIf(falseCondition, mockFormValues)).toBe(false);
    });

    test('handles nested condition groups', () => {
      const complexCondition = JSON.stringify({
        operator: 'AND',
        conditions: [
          createEqualsCondition('fahrzeugtyp', 'auto'),
          {
            operator: 'OR',
            conditions: [
              createEqualsCondition('getriebe', 'automatik'),
              createEqualsCondition('getriebe', 'schaltung')
            ]
          }
        ]
      });
      expect(evaluateVisibleIf(complexCondition, mockFormValues)).toBe(true);
    });

    test('returns true for invalid JSON (fallback)', () => {
      const invalidJson = '{"field": "getriebe", "operator": "equals", "value": "automatik"';
      expect(evaluateVisibleIf(invalidJson, mockFormValues)).toBe(true);
    });

    test('handles unknown operators gracefully', () => {
      const unknownOperator = JSON.stringify({
        field: 'getriebe',
        operator: 'unknown_operator',
        value: 'automatik'
      });
      expect(evaluateVisibleIf(unknownOperator, mockFormValues)).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    test('createEqualsCondition creates correct condition', () => {
      const condition = createEqualsCondition('getriebe', 'automatik');
      expect(condition).toEqual({
        field: 'getriebe',
        operator: 'equals',
        value: 'automatik'
      });
    });

    test('createAndCondition creates correct condition group', () => {
      const condition1 = createEqualsCondition('fahrzeugtyp', 'auto');
      const condition2 = createEqualsCondition('getriebe', 'automatik');
      const andCondition = createAndCondition(condition1, condition2);
      
      expect(andCondition).toEqual({
        operator: 'AND',
        conditions: [condition1, condition2]
      });
    });

    test('createOrCondition creates correct condition group', () => {
      const condition1 = createEqualsCondition('zustand', 'neu');
      const condition2 = createEqualsCondition('zustand', 'gebraucht');
      const orCondition = createOrCondition(condition1, condition2);
      
      expect(orCondition).toEqual({
        operator: 'OR',
        conditions: [condition1, condition2]
      });
    });
  });

  describe('Example Conditions', () => {
    const mockFormValues = {
      getriebe: 'automatik',
      fahrzeugtyp: 'auto',
      zustand: 'neu'
    };

    test('simple condition example works', () => {
      const condition = JSON.stringify(exampleConditions.simple);
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseValues = { ...mockFormValues, getriebe: 'schaltung' };
      expect(evaluateVisibleIf(condition, falseValues)).toBe(false);
    });

    test('complex condition example works', () => {
      const condition = JSON.stringify(exampleConditions.complex);
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseValues = { ...mockFormValues, fahrzeugtyp: 'motorrad' };
      expect(evaluateVisibleIf(condition, falseValues)).toBe(false);
    });

    test('OR condition example works', () => {
      const condition = JSON.stringify(exampleConditions.orCondition);
      expect(evaluateVisibleIf(condition, mockFormValues)).toBe(true);
      
      const falseValues = { ...mockFormValues, zustand: 'gebraucht' };
      expect(evaluateVisibleIf(condition, falseValues)).toBe(false);
      
      const completelyFalseValues = { ...mockFormValues, zustand: 'defekt' };
      expect(evaluateVisibleIf(condition, completelyFalseValues)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined field values', () => {
      const condition = JSON.stringify(createEqualsCondition('undefined_field', 'value'));
      expect(evaluateVisibleIf(condition, {})).toBe(false);
    });

    test('handles null field values', () => {
      const condition = JSON.stringify(createEqualsCondition('null_field', 'value'));
      expect(evaluateVisibleIf(condition, { null_field: null })).toBe(false);
    });

    test('handles empty string field values', () => {
      const condition = JSON.stringify(createEqualsCondition('empty_field', 'value'));
      expect(evaluateVisibleIf(condition, { empty_field: '' })).toBe(false);
    });

    test('handles empty array field values', () => {
      const condition = JSON.stringify(createEqualsCondition('empty_array_field', 'value'));
      expect(evaluateVisibleIf(condition, { empty_array_field: [] })).toBe(false);
    });

    test('handles boolean field values', () => {
      const condition = JSON.stringify(createEqualsCondition('bool_field', true));
      expect(evaluateVisibleIf(condition, { bool_field: true })).toBe(true);
      expect(evaluateVisibleIf(condition, { bool_field: false })).toBe(false);
    });
  });
});
