module AngularThumbnails.PDF {
    export class PaginationStatus {
        constructor(private totalPages:number, private currentPage:number = 1) {
            if (currentPage > totalPages) {
                throw new Error();
            }

            if (currentPage < 0) {
                throw new Error();
            }
        }

        getCurrentPage():number {
            return this.currentPage;
        }

        getPageCount():number {
            return this.totalPages;
        }

        isLastPage():boolean {
            return this.getCurrentPage() == this.getPageCount();
        }

        isFirstPage():boolean {
            return this.getCurrentPage() == 1;
        }

        moveToNextPage():number {
            if (this.getCurrentPage() < this.getPageCount()) {
                this.currentPage += 1;
            }

            return this.getCurrentPage();
        }

        moveToPreviousPage():number {
            if (this.getCurrentPage() > 1) {
                this.currentPage -= 1;
            }

            return this.getCurrentPage();
        }
    }
}
