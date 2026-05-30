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
}