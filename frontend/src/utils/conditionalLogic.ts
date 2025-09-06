/**
 * Utility-Funktionen für Conditional Logic in dynamischen Formularen
 * Unterstützt einfache Bedingungen basierend auf Feldwerten
 */

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: unknown;
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (ConditionRule | ConditionGroup)[];
}

export type Condition = ConditionRule | ConditionGroup;

/**
 * Wertet eine einzelne Bedingung aus
 */
const evaluateConditionRule = (rule: ConditionRule, formValues: Record<string, unknown>): boolean => {
  const fieldValue = formValues[rule.field];
  
  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;
    
    case 'not_equals':
      return fieldValue !== rule.value;
    
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(String(rule.value));
      }
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(String(rule.value));
      }
      return false;
    
    case 'not_contains':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(String(rule.value));
      }
      if (typeof fieldValue === 'string') {
        return !fieldValue.includes(String(rule.value));
      }
      return true;
    
    case 'greater_than':
      if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
        return fieldValue > rule.value;
      }
      return false;
    
    case 'less_than':
      if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
        return fieldValue < rule.value;
      }
      return false;
    
    case 'is_empty':
      return fieldValue === undefined || fieldValue === null || fieldValue === '' || 
             (Array.isArray(fieldValue) && fieldValue.length === 0);
    
    case 'is_not_empty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && 
             (!Array.isArray(fieldValue) || fieldValue.length > 0);
    
    default:
      return false;
  }
};

/**
 * Wertet eine Bedingungsgruppe aus (AND/OR)
 */
const evaluateConditionGroup = (group: ConditionGroup, formValues: Record<string, unknown>): boolean => {
  if (group.operator === 'AND') {
    return group.conditions.every(condition => evaluateCondition(condition, formValues));
  } else { // OR
    return group.conditions.some(condition => evaluateCondition(condition, formValues));
  }
};

/**
 * Wertet eine Bedingung aus (Regel oder Gruppe)
 */
const evaluateCondition = (condition: Condition, formValues: Record<string, unknown>): boolean => {
  if ('field' in condition) {
    return evaluateConditionRule(condition, formValues);
  } else {
    return evaluateConditionGroup(condition, formValues);
  }
};

/**
 * Hauptfunktion: Wertet eine visible_if Bedingung aus
 * @param visibleIf - JSON-String mit der Bedingung
 * @param formValues - Aktuelle Formular-Werte
 * @returns true wenn das Feld angezeigt werden soll, false wenn versteckt
 */
export const evaluateVisibleIf = (
  visibleIf: string, 
  formValues: Record<string, unknown>
): boolean => {
  if (!visibleIf || visibleIf.trim() === '') {
    return true; // Keine Bedingung = immer anzeigen
  }

  try {
    const parsed = JSON.parse(visibleIf);
    return evaluateCondition(parsed, formValues);
  } catch (error) {
    console.warn('Fehler beim Parsen der visible_if Bedingung:', error);
    return true; // Fallback: bei Fehlern immer anzeigen
  }
};

/**
 * Hilfsfunktion: Erstellt eine einfache equals-Bedingung
 */
export const createEqualsCondition = (field: string, value: unknown): ConditionRule => ({
  field,
  operator: 'equals',
  value
});

/**
 * Hilfsfunktion: Erstellt eine AND-Bedingung
 */
export const createAndCondition = (...conditions: Condition[]): ConditionGroup => ({
  operator: 'AND',
  conditions
});

/**
 * Hilfsfunktion: Erstellt eine OR-Bedingung
 */
export const createOrCondition = (...conditions: Condition[]): ConditionGroup => ({
  operator: 'OR',
  conditions
});

/**
 * Beispiel-Bedingungen für Tests
 */
export const exampleConditions = {
  // Einfache Bedingung: Feld wird nur angezeigt wenn "getriebe" = "automatik" ist
  simple: createEqualsCondition('getriebe', 'automatik'),
  
  // Komplexe Bedingung: Feld wird angezeigt wenn "fahrzeugtyp" = "auto" UND "getriebe" = "automatik"
  complex: createAndCondition(
    createEqualsCondition('fahrzeugtyp', 'auto'),
    createEqualsCondition('getriebe', 'automatik')
  ),
  
  // OR-Bedingung: Feld wird angezeigt wenn "zustand" = "neu" ODER "zustand" = "wie neu"
  orCondition: createOrCondition(
    createEqualsCondition('zustand', 'neu'),
    createEqualsCondition('zustand', 'wie neu')
  )
};
