import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { PhotoRequirementsModal } from './photo-requirements-modal';

describe('PhotoRequirementsModal', () => {
  let component: PhotoRequirementsModal;
  let fixture: ComponentFixture<PhotoRequirementsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoRequirementsModal],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: () => undefined },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoRequirementsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
