import { Person, PositionedPerson, TreeDimensions } from './types';

/**
 * Generate a slug ID from a person's name
 */
export function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * Calculate tree dimensions based on the family data
 */
export function calculateTreeDimensions(rootPerson: Person): TreeDimensions {
  const maxGeneration = getMaxGeneration(rootPerson);
  const maxSiblingsInGeneration = getMaxSiblingsInGeneration(rootPerson);
  
  return {
    width: Math.max(800, maxSiblingsInGeneration * 200 + 100),
    height: (maxGeneration + 1) * 150 + 100,
    generationHeight: 150,
    nodeWidth: 180,
    nodeHeight: 60,
    horizontalSpacing: 200,
    verticalSpacing: 150,
  };
}

/**
 * Get the maximum generation depth
 */
function getMaxGeneration(person: Person, currentGeneration = 0): number {
  if (!person.children || person.children.length === 0) {
    return currentGeneration;
  }
  
  return Math.max(
    ...person.children.map(child => 
      getMaxGeneration(child, currentGeneration + 1)
    )
  );
}

/**
 * Get the maximum number of siblings in any generation
 */
function getMaxSiblingsInGeneration(person: Person): number {
  const generationCounts: number[] = [];
  
  function countSiblingsAtGeneration(p: Person, generation: number) {
    if (!generationCounts[generation]) {
      generationCounts[generation] = 0;
    }
    generationCounts[generation]++;
    
    if (p.children) {
      p.children.forEach(child => 
        countSiblingsAtGeneration(child, generation + 1)
      );
    }
  }
  
  countSiblingsAtGeneration(person, 0);
  return Math.max(...generationCounts);
}

/**
 * Position all nodes in the tree with proper layout
 */
export function positionTreeNodes(
  rootPerson: Person,
  dimensions: TreeDimensions
): PositionedPerson {
  // First pass: assign generations and IDs
  const withGenerations = assignGenerations(rootPerson, 0);
  
  // Second pass: calculate positions
  const positioned = calculatePositions(withGenerations, dimensions);
  
  return positioned;
}

/**
 * Assign generation numbers and IDs to all nodes
 */
function assignGenerations(person: Person, generation: number): PositionedPerson {
  const id = person.id || generateId(person.name);
  
  const positioned: PositionedPerson = {
    ...person,
    id,
    generation,
    x: 0, // Will be calculated later
    y: generation * 150 + 50,
    children: person.children?.map(child => 
      assignGenerations(child, generation + 1)
    ),
  };
  
  return positioned;
}

/**
 * Calculate X positions for all nodes
 */
function calculatePositions(
  person: PositionedPerson,
  dimensions: TreeDimensions,
  siblingIndex = 0,
  totalSiblings = 1
): PositionedPerson {
  // Calculate positions for children first (bottom-up approach)
  if (person.children && person.children.length > 0) {
    person.children = person.children.map((child, index) =>
      calculatePositions(child, dimensions, index, person.children!.length)
    );
    
    // Position parent centered above children
    const childrenXPositions = person.children.map(child => child.x);
    const minX = Math.min(...childrenXPositions);
    const maxX = Math.max(...childrenXPositions);
    person.x = (minX + maxX) / 2;
  } else {
    // Leaf node: position based on sibling index
    const totalWidth = (totalSiblings - 1) * dimensions.horizontalSpacing;
    const startX = dimensions.width / 2 - totalWidth / 2;
    person.x = startX + siblingIndex * dimensions.horizontalSpacing;
  }
  
  return person;
}

/**
 * Get all ancestors of a person
 */
export function getAncestors(
  personId: string,
  rootPerson: PositionedPerson,
  ancestors: Set<string> = new Set()
): Set<string> {
  function findAncestorsRecursive(current: PositionedPerson, targetId: string): boolean {
    if (current.id === targetId) {
      return true;
    }
    
    if (current.children) {
      for (const child of current.children) {
        if (findAncestorsRecursive(child, targetId)) {
          ancestors.add(current.id);
          return true;
        }
      }
    }
    
    return false;
  }
  
  findAncestorsRecursive(rootPerson, personId);
  return ancestors;
}

/**
 * Get all descendants of a person
 */
export function getDescendants(
  person: PositionedPerson,
  descendants: Set<string> = new Set()
): Set<string> {
  if (person.children) {
    person.children.forEach(child => {
      descendants.add(child.id);
      getDescendants(child, descendants);
    });
  }
  
  return descendants;
}

/**
 * Find a person by ID in the tree
 */
export function findPersonById(
  rootPerson: PositionedPerson,
  targetId: string
): PositionedPerson | null {
  if (rootPerson.id === targetId) {
    return rootPerson;
  }
  
  if (rootPerson.children) {
    for (const child of rootPerson.children) {
      const found = findPersonById(child, targetId);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Format display name for a person (including spouse if present)
 */
export function getDisplayName(person: Person): string {
  if (person.spouse) {
    return `${person.name} and ${person.spouse}`;
  }
  return person.name;
}
