import { describe, it, expect } from '@jest/globals';
import { 
  formatPersonName, 
  getDisplayName, 
  generateId,
  positionTreeNodes,
  calculateTreeDimensions
} from '../treeUtils';
import { Person } from '../types';

describe('Integration Tests - Requirements Validation', () => {
  const sampleFamilyData: Person = {
    first_name: "Cornelius",
    nickname: "",
    last_name: "O'Donovan",
    spouse: "Mary Smith",
    children: [
      {
        first_name: "John",
        nickname: "",
        last_name: "O'Donovan",
        spouse: "Ellen O'Neill",
        children: [
          {
            first_name: "Cornelius",
            nickname: "Con",
            last_name: "O'Donovan",
            spouse: "Agnes Monks",
            children: [
              {
                first_name: "Sean",
                nickname: "",
                last_name: "O'Donovan",
                spouse: "Annette McEvoy",
                children: []
              },
              {
                first_name: "Ellen",
                nickname: "Nell",
                last_name: "O'Donovan",
                spouse: "",
                children: []
              }
            ]
          }
        ]
      }
    ]
  };

  describe('Name Display Format Requirements', () => {
    it('should format names as "first_name" "nickname" "last_name" with quotes', () => {
      const personWithNickname: Person = {
        first_name: "Cornelius",
        nickname: "Con",
        last_name: "O'Donovan"
      };
      
      const personWithoutNickname: Person = {
        first_name: "John",
        nickname: "",
        last_name: "O'Donovan"
      };

      expect(formatPersonName(personWithNickname)).toBe('Cornelius "Con" \'O\'Donovan');
      expect(formatPersonName(personWithoutNickname)).toBe("John 'O'Donovan");
    });
  });

  describe('Recursive ID Generation Requirements', () => {
    it('should generate IDs using recursive node structure not based on names', () => {
      const dimensions = calculateTreeDimensions(sampleFamilyData);
      const positioned = positionTreeNodes(sampleFamilyData, dimensions);

      // Root should have ID 'root'
      expect(positioned.id).toBe('root');
      
      // Children should have IDs based on parent and sibling index
      if (positioned.children && positioned.children.length > 0) {
        expect(positioned.children[0].id).toBe('root-0');
        
        if (positioned.children[0].children && positioned.children[0].children.length > 0) {
          expect(positioned.children[0].children[0].id).toBe('root-0-0');
          
          if (positioned.children[0].children[0].children && positioned.children[0].children[0].children.length > 0) {
            expect(positioned.children[0].children[0].children[0].id).toBe('root-0-0-0');
            expect(positioned.children[0].children[0].children[1].id).toBe('root-0-0-1');
          }
        }
      }
    });
  });

  describe('Spouse Display Logic Requirements', () => {
    it('should only show spouse when showSpouse is true', () => {
      const personWithSpouse: Person = {
        first_name: "John",
        nickname: "",
        last_name: "O'Donovan",
        spouse: "Ellen O'Neill"
      };

      // Should not show spouse by default
      expect(getDisplayName(personWithSpouse)).toBe("John 'O'Donovan");
      
      // Should show spouse when explicitly requested
      expect(getDisplayName(personWithSpouse, true)).toBe("John 'O'Donovan and Ellen O'Neill");
      
      // Should not show spouse when explicitly set to false
      expect(getDisplayName(personWithSpouse, false)).toBe("John 'O'Donovan");
    });
  });

  describe('Layout Optimization Requirements', () => {
    it('should use optimized dimensions for minimal padding and close spacing', () => {
      const dimensions = calculateTreeDimensions(sampleFamilyData);
      
      // Should use smaller, optimized dimensions
      expect(dimensions.nodeWidth).toBe(100); // Reduced from 180
      expect(dimensions.nodeHeight).toBe(40); // Reduced from 60
      expect(dimensions.horizontalSpacing).toBe(120); // Reduced from 200
      expect(dimensions.verticalSpacing).toBe(120); // Reduced from 150
      expect(dimensions.generationHeight).toBe(120); // Reduced from 150
    });
  });

  describe('Data Structure Compatibility', () => {
    it('should handle the new JSON structure with all required fields', () => {
      const person: Person = {
        first_name: "Test",
        nickname: "Tester",
        last_name: "Person",
        spouse: "Test Spouse",
        birth: { date: "1990-01-01", location: "Test City" },
        death: { date: "", location: "" },
        tree_color: "blue",
        children: []
      };

      // Should format name correctly
      expect(formatPersonName(person)).toBe('Test "Tester" \'Person');
      
      // Should handle all fields without errors
      expect(() => {
        const dimensions = calculateTreeDimensions(person);
        positionTreeNodes(person, dimensions);
      }).not.toThrow();
    });
  });
});
