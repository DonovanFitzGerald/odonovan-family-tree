'use client';

import { PositionedPerson } from '@/lib/types';

interface TreeConnectorsProps {
  rootPerson: PositionedPerson;
  width: number;
  height: number;
}

export default function TreeConnectors({ rootPerson, width, height }: TreeConnectorsProps) {
  const connections: JSX.Element[] = [];

  function generateConnections(person: PositionedPerson) {
    if (!person.children || person.children.length === 0) {
      return;
    }

    const parentX = person.x;
    const parentY = person.y + 30; // Bottom of parent node
    
    // Calculate midpoint Y between parent and children
    const childY = person.children[0].y - 30; // Top of child nodes
    const midY = parentY + (childY - parentY) / 2;

    // If only one child, draw a straight line
    if (person.children.length === 1) {
      const child = person.children[0];
      connections.push(
        <path
          key={`${person.id}-${child.id}`}
          d={`M ${parentX} ${parentY} L ${parentX} ${midY} L ${child.x} ${midY} L ${child.x} ${childY}`}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-400 dark:text-gray-500"
        />
      );
    } else {
      // Multiple children: draw horizontal line connecting all children
      const leftmostChild = person.children.reduce((leftmost, child) => 
        child.x < leftmost.x ? child : leftmost
      );
      const rightmostChild = person.children.reduce((rightmost, child) => 
        child.x > rightmost.x ? child : rightmost
      );

      // Vertical line from parent down
      connections.push(
        <path
          key={`${person.id}-vertical`}
          d={`M ${parentX} ${parentY} L ${parentX} ${midY}`}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-400 dark:text-gray-500"
        />
      );

      // Horizontal line connecting all children
      connections.push(
        <path
          key={`${person.id}-horizontal`}
          d={`M ${leftmostChild.x} ${midY} L ${rightmostChild.x} ${midY}`}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-400 dark:text-gray-500"
        />
      );

      // Vertical lines down to each child
      person.children.forEach((child) => {
        connections.push(
          <path
            key={`${person.id}-${child.id}`}
            d={`M ${child.x} ${midY} L ${child.x} ${childY}`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-400 dark:text-gray-500"
          />
        );
      });
    }

    // Recursively generate connections for children
    person.children.forEach(child => generateConnections(child));
  }

  generateConnections(rootPerson);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: 1 }}
    >
      {connections}
    </svg>
  );
}
