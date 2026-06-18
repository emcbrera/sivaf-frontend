import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoHistory } from './photo-history';

describe('PhotoHistory', () => {
  let component: PhotoHistory;
  let fixture: ComponentFixture<PhotoHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
