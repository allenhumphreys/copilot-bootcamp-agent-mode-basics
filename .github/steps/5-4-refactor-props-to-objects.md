### :keyboard: Activity: Refactoring (part 1 - converting long parameter lists to objects)

In this step, you'll use GitHub Copilot's Agent mode to refactor some preexisting code that needs some simplification of method calls with long input parameter lists. Now that the debugging issues are resolved, we can safely refactor the code.

1. Open the **Copilot** chat panel, switch to **Agent** mode and **Claude 3.7 Sonnet** model using the dropdown menus.

2. :paperclip: Attach the following files to the GitHub Copilot Chat context window to include for code refactoring :paperclip: 
   1. `packages/frontend/src/components/ItemDetails.js`
   2. `packages/frontend/src/utils/ItemService.js`
   3. `packages/backend/src/controllers/ItemDetailsController.js`
   4. `packages/frontend/src/App.js`
   5. `packages/backend/src/app.js`

3. :pencil2: Enter a prompt to get GitHub Copilot to refactor the attached files by simplifying the long parameter lists into objects :pencil2:
   
4. :mag: Run the application with `npm run start` in the root directory to test the functionality.
   
   - All functionality should continue to work
   - All unit tests `npm run test` should continue to work

5. :mag: Check if the code has been refactored to your specification (long parameters lists are converted to objects)

6. :repeat: If the codebase has not yet been refactored or something is now broken, keep asking GitHub Copilot to refactor anything missed or resolve issues observed.

7. :white_check_mark: When everything succeeds, commit all changes and push branch `feature/code-refactoring` up.

### Success Criteria

To complete this exercise successfully, ensure that:
   - Code changes are commited to the `feature/code-refactoring` branch.
   - All input parameters are converted to objects in the specified files.

If you encounter any issues, you can:
- Double check that the pushed branch is called `feature/code-refactoring`
- Ask Copilot to fix specific problems