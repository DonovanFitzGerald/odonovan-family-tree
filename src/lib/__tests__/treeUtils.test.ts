import { describe, it, expect } from '@jest/globals';
import { 
  generateId, 
  getDisplayName, 
  calculateTreeDimensions,
  positionTreeNodes 
} from '../treeUtils';
import { Person } from '../types';

describe('treeUtils', () => {
  describe('generateId', () => {
    it('should generate a slug from a name', () => {
      expect(generateId("John O'Donovan")).toBe('john-odonovan');
      expect(generateId('Cornelius (Con)')).toBe('cornelius-con');
      expect(generateId('Ellen O\'Neill')).toBe('ellen-oneill');
    });
  });

  describe('getDisplayName', () => {
    it('should return just the name when no spouse', () => {
      const person: Person = { name: 'John Doe' };
      expect(getDisplayName(person)).toBe('John Doe');
    });

    it('should return combined name when spouse exists', () => {
      const person: Person = { name: 'John Doe', spouse: 'Jane Smith' };
      expect(getDisplayName(person)).toBe('John Doe and Jane Smith');
    });
  });

  describe('calculateTreeDimensions', () => {
    it('should calculate dimensions for a simple tree', () => {
      const person: Person = {
        name: 'Root',
        children: [
          { name: 'Child 1' },
          { name: 'Child 2' }
        ]
      };

      const dimensions = calculateTreeDimensions(person);
      
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
      expect(dimensions.generationHeight).toBe(150);
      expect(dimensions.nodeWidth).toBe(180);
      expect(dimensions.nodeHeight).toBe(60);
    });
  });

  describe('positionTreeNodes', () => {
    it('should position nodes with correct coordinates', () => {
      const person: Person = {
        name: 'Root',
        children: [
          { name: 'Child 1' },
          { name: 'Child 2' }
        ]
      };

      const dimensions = calculateTreeDimensions(person);
      const positioned = positionTreeNodes(person, dimensions);

      expect(positioned.x).toBeGreaterThanOrEqual(0);
      expect(positioned.y).toBeGreaterThanOrEqual(0);
      expect(positioned.generation).toBe(0);
      expect(positioned.id).toBe('root');
      
      if (positioned.children) {
        expect(positioned.children).toHaveLength(2);
        positioned.children.forEach(child => {
          expect(child.generation).toBe(1);
          expect(child.x).toBeGreaterThanOrEqual(0);
          expect(child.y).toBeGreaterThan(positioned.y);
        });
      }
    });
  });
});
