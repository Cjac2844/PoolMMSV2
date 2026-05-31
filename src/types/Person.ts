export interface BandTest {
  id: string;
  bandType: 'Red Band' | 'Green Band';
  issuedBy: string;
  issuedAt: Date;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  checkedInTime: Date;
  personType?: string;
  familyName?: string;
  age?: number;
  notes?: string;
  lastVisit?: Date;
  bandTests?: BandTest[];
}