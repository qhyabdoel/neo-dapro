import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, Renderer2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslationService, JsonService } from 'src/app/libs/services';
declare var $: any;

@Component({
  selector: 'pq-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent implements OnInit, AfterViewInit {
  @ViewChild('creditTemplate', { static: true }) creditTemplates: ElementRef;
  @ViewChild('videotutorialTemplate', { static: true }) videotutorialTemplate: ElementRef;
  @ViewChild('toggleButton4') toggleButton: ElementRef;
  @ViewChild('menu4') menu: ElementRef;
  isOpen: boolean = false;
  dataRoot: any;
  dataChild: any;
  selectedType;

  listTeam: any = [];
  options: string[] = ['Help', 'Video Tutorial', 'Team Credit'];

  constructor(
    private modalService: NgbModal,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    public cdRef: ChangeDetectorRef,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private renderer: Renderer2
  ) {
    this.sanitizer = sanitizer;

    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (!this.toggleButton.nativeElement.contains(e.target) && !this.menu.nativeElement.contains(e.target)) {
        this.isOpen = false;
        this.cdRef.detectChanges();
      }
    });
  }

  async ngOnInit() {
    this.listTeam = await this.jsonService.retTeam();
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.http
      .get('assets/data/video_tutorial.json')
      .toPromise()
      .then((data) => {
        this.dataRoot = data['root'];
        this.dataChild = data['child'];
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }

  openModalTemplate(content) {
    const modalRef = this.modalService.open(content, { centered: false, size: 'lg' }).result.then((result) => {});
    this.handleDialog();
    setTimeout(function () {
      $('.loadyoutube').lightGallery({
        selector: 'a',
        zoom: false,
        autoplayControls: false,

        loadYoutubeThumbnail: true,
        youtubeThumbSize: 'default',
      });
    }, 500);
  }

  ngAfterViewInit(): void {
    this.selectedType = 'd-processing-tutorial';
  }

  selectedTab(id: string): any {
    this.selectedType = id;
  }

  urlLoad(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  handleDialog = () => {
    this.isOpen = !this.isOpen;
  };
}
