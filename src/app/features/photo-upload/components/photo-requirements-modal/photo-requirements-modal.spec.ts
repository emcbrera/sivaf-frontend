import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoRequirementsModal } from './photo-requirements-modal';

describe('PhotoRequirementsModal', () => {
  let component: PhotoRequirementsModal;
  let fixture: ComponentFixture<PhotoRequirementsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoRequirementsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoRequirementsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
