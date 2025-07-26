# bookmark-info  
The extension improves the browser's capabilities for working with bookmarks. 

* fast add bookmarks:
  * from selection in page.  
    &nbsp;&nbsp;&nbsp;Shortcut Ctrl+Shift+Period(dot) and context command.  
    &nbsp;&nbsp;&nbsp;Selection is used as folder name for new bookmark.  
    &nbsp;&nbsp;&nbsp;The extension is looking for folder (case and plural insensitive) or create new. 
  * from user input.  
    &nbsp;&nbsp;&nbsp;Shortcut Ctrl+Shift+Comma and context command.  
  * from last used list.  
    &nbsp;&nbsp;&nbsp;Last used list contains up to 50 last used folders.  
    &nbsp;&nbsp;&nbsp;Standard browser last used list contains only 5 items.  
    &nbsp;&nbsp;&nbsp;User can pin selected items in last used list.  
    &nbsp;&nbsp;&nbsp;User can delete bookmark using last used list. Click on tag second time.    
* extension shows existing bookmarks for active page in the right top corner.
* fast delete bookmark  
    &nbsp;&nbsp;&nbsp;Hover over bookmark and click small red button

## additional functionality for bookmarks
* User can hide bookmark labels by clicking on label.  
  &nbsp;&nbsp;&nbsp;To get access to buttons and links on the page under this labels
* Dated Bookmark Folders  
  &nbsp;&nbsp;&nbsp;Dated folders are folders that have "@D" at the end of their name.  
  &nbsp;&nbsp;&nbsp;When a user adds a bookmark to a dated folder "DONE @D", this extension replaces the @D with the actual date.  
  &nbsp;&nbsp;&nbsp;I use "DONE @D" to mark a list of news items or a list of author publications that I have finished  
  &nbsp;&nbsp;&nbsp;I use "Selected @D" to mark a page that I don't have time to rate right now.
* Option "Show author bookmarks with post bookmarks"  
  &nbsp;&nbsp;&nbsp;This feature implemented for dev.to, freecodecamp.org, linkedin.com, youtube.com and can be extended to other sites.
* Option 'Show bookmark title'.

## flat folder structure for bookmarks
The extension allows you to quickly switch to a flat folder structure for bookmarks.  
    &nbsp;&nbsp;The flat folder structure allows you to quickly find the desired folder since all  folders are on the first level and sorted.  
    &nbsp;&nbsp;In this mode on every browser start:  
      &nbsp;&nbsp;&nbsp;&nbsp; * folders with name starting with 'todo' are moved to root folder 'Bookmarks Toolbar'  
      &nbsp;&nbsp;&nbsp;&nbsp; * other folders are moved to root folder 'Other Bookmarks'  
      &nbsp;&nbsp;&nbsp;&nbsp; * nested folders are moved to root folder. Empty nested folders are deleted.  
      &nbsp;&nbsp;&nbsp;&nbsp; * folders are sorted  
      &nbsp;&nbsp;&nbsp;&nbsp; * folders with equal names (case and plural insensitive) are merged  
      &nbsp;&nbsp;&nbsp;&nbsp; * folders with not descriptive names (name starts with 'New folder', '[Folder Name]') are merged to 'Other bookmarks\zz-bookmark-info--unclassified'

## extra functionality  
* The extension clears url from search params on opening for defined sites.
* Command 'clear url from hash and all search params' in page context menu.
* Option 'Shows the previous visits'  
  &nbsp;&nbsp;&nbsp;User can distinguish between visited and new pages. New page don't have previous visits.
* Command 'Close duplicate tabs' in page context menu.
* Option 'Hide html-tags header, footer, aside, nav on printing.'.
* Option 'Hide page header for youtube channel'.
