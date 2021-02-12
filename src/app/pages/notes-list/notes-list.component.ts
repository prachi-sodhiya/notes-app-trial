import { NotesService } from './../../shared/notes.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { transition, trigger, style, animate, query, stagger } from '@angular/animations';
@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      // Entry Animation
      transition('void => *', [
        //Initian state
        style(
          {
             height: 0,
             opacity: 0,
             transform: 'scale(0.85)',
             'margin-bottom': 0,

             //we have to 'expand' out the padding properties
             paddingTop: 0,
             paddingBottom: 0,
             paddingRight: 0,
             paddingLeft: 0,
          }),
          //we first want to animate the spacing (which includes height and margin)

          animate('50ms', style({
            height: '*',
            'margin-bottom': '*',
            paddingTop: '*',
            paddingBottom: '*',
            paddingLeft: '*',
            paddingRight: '*',

          })),

           animate(68)
      ]),
      transition('* => void', [
        //first scale up
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        //then scale down back to normal size while beginning to the fade out
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        // scale down and fade out completely
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        // then animate the spacing (which includes height and margin)
         animate('150ms ease-out', style({
           
           height: 0,
           paddingTop: 0,
           paddingBottom: 0,
           paddingRight: 0,
           paddingLeft: 0,
           'margin-bottom': '0',
         }))
      ])
    ]),
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity:0,
            height: 0
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

notes: Note[] = new Array<Note>();

filteredNotes: Note[] = new Array<Note>();

@ViewChild('filterInput') filterInputElRef: ElementRef<HTMLInputElement>;

  constructor(private notesService: NotesService) { }

  ngOnInit() {
      // we want to retrieve all notes from NotesService
     this.notes = this.notesService.getAll(); 
     //this.filteredNotes = this.notesService.getAll();
     this.filter('');

  }

  deleteNote(note: Note)
  {
    let noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);

  }

  generateNoteURL(note: Note)
  {
    let noteId = this.notesService.getId(note);
    return noteId;
  }

  filter(query: string)
  {
    query = query.toLowerCase().trim();
    
    let allResults: Note[] = new Array<Note>();

    // split up a search query into individual words
    let terms: string[] = query.split(' '); // split on spaces
    // removes duplicate search terms
    terms = this.removeDuplicates(terms);
    //compile all relevent  results into the allResults array
    terms.forEach(terms => {
      let results: Note[] = this.relevantNotes(terms);
      //append results to the allResults array ,, // following is the destructuring assignement inJS(ES6)
      allResults = [...allResults, ...results] 
    });

    // allResults will include duplicate notes
    //  because a particular note can be the result of many search terms
    // but we sont want to show the same note multiple times on the UI
    //so we first must remove the duplicates

    let uniqueResults = this.removeDuplicates(allResults);
    this.filteredNotes = uniqueResults;

    this.sortByRelevancy(allResults);

  }

  removeDuplicates(arr: Array<any>) : Array<any>
  {
    let uniqueResults: Set<any> = new Set<any>();
    //loop through the input array and add the item to the set  
    arr.forEach(e => uniqueResults.add(e)); 
    return Array.from(uniqueResults);

  }

  relevantNotes(query: string) : Array<Note>
  {
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(note =>
      {
        if(note.title && note.title.toLowerCase().includes(query))
        {
          return true;
        }
        if(note.body && note.body.toLowerCase().includes(query))
        {
          return true;
        }
        return false;
      })
      return relevantNotes;
  }

  sortByRelevancy(searchResults: Note[])
  {
    //This method will calculate the relevancy of a note based on the number of times it appears in
    // the search results

    let noteCountObj: Object = {}; // format - key:value => NoteId:number (note object id: count)

    searchResults.forEach(note =>
      {
        let noteId = this.notesService.getId(note); // get the notes id
        if(noteCountObj[noteId])
        {
          noteCountObj[noteId] += 1;
        } else
        {
          noteCountObj[noteId] = 1;
        }
      })

      this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) =>
      {
        let aId = this.notesService.getId(a);
        let bId = this.notesService.getId(b);

        let aCount = noteCountObj[aId];
        let bCount = noteCountObj[bId];
        return bCount - aCount ;
      }
      )
  }

  

}
