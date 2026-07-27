import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoCapture } from './photo-capture';

describe('PhotoCapture', () => {
  let component: PhotoCapture;
  let fixture: ComponentFixture<PhotoCapture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoCapture],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoCapture);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
