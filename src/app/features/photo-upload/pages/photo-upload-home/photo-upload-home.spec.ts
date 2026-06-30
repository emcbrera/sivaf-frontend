import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoUploadHome } from './photo-upload-home';

describe('PhotoUploadHome', () => {
  let component: PhotoUploadHome;
  let fixture: ComponentFixture<PhotoUploadHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoUploadHome],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoUploadHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
