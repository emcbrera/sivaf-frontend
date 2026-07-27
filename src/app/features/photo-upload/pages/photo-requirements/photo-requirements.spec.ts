import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoRequirements } from './photo-requirements';

describe('PhotoRequirements', () => {
  let component: PhotoRequirements;
  let fixture: ComponentFixture<PhotoRequirements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoRequirements],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoRequirements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
