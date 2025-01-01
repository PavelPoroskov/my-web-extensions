# bookmark-info
The extension improves the browser's capabilities for working with bookmarks. 

* fast add bookmarks:
  * from selection in page.  
    &nbsp;&nbsp;&nbsp;Shortcut Ctrl+Shift+Period(dot) and context command.  
    &nbsp;&nbsp;&nbsp;Selection is used as folder name for new bookmark.  
    &nbsp;&nbsp;&nbsp;The extension is looking for folder (case and plural insensitive) or create new. 
  * from user input.  
    &nbsp;&nbsp;&nbsp;Shortcut Ctrl+Shift+Comma and context command.  
    &nbsp;&nbsp;&nbsp;You can enter a list using comma.
  * from last used list.  
    &nbsp;&nbsp;&nbsp;Last used list contains up to 50 last used folders.  
    &nbsp;&nbsp;&nbsp;Standard browser last used list contains only 5 items.  
    &nbsp;&nbsp;&nbsp;User can pin selected items in last used list.  
    &nbsp;&nbsp;&nbsp;User can delete bookmark using last used list. Click on tag second time.    
* extension shows existing bookmarks for active page in the right top corner.
* fast delete bookmark  
    &nbsp;&nbsp;&nbsp;Hover over bookmark and click small red button

## additional functionality
* User can hide bookmark labels by clicking on label.  
  &nbsp;&nbsp;&nbsp;To get access to buttons and links on the page under this labels
* Command 'clear url from hash and all search params' in page context menu.
* The extension allows you to quickly switch to a flat folder structure.  
    &nbsp;&nbsp;&nbsp;The flat folder structure allows you to quickly find the desired folder since all  folders are on the first level and sorted.  
    &nbsp;&nbsp;&nbsp;In this mode on every browser start:  
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * folders with name starting with 'todo' are moved to root folder 'Bookmarks Toolbar'  
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * other folders are moved to root folder 'Other Bookmarks'  
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * nested folders are moved to root folder. Empty nested folders are deleted.  
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * folders are sorted  
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * folders with equal names (case and plural insensitive) are merged  
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; * folders with not descriptive names (name starts with 'New folder', '[Folder Name]') are merged to 'Other bookmarks\zz-bookmark-info--unclassified'
* Option 'Show bookmark title'.
* The extension clears url from query params on opening for defined sites.
* New bookmarks are added to the start of a folder.
* Option 'Shows the previous visits'  
  &nbsp;&nbsp;&nbsp;User can distinguish between visited and new pages. New page don't have previous visits.
* Command 'Close duplicate tabs' in page context menu.
* Option 'Hide page header for youtube channel'.
* Option 'Hide html-tags header, footer, aside, nav on printing.'.
