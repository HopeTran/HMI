import { capitalize } from 'lodash';
import { NavLink, RouteComponentProps, useParams } from 'react-router-dom';

import CategoryFilter from './CategoryFilter';
import StoreListing from './StoreListing';

import FilterIcon from 'statics/images/icons/filter.png'
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState } from 'react';

export default function CategoryDetail(props: RouteComponentProps) {
  const { category }: any = useParams();
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(false);

  const onHideCategoryFilter = () => {
    setIsCategoryFilterVisible(false)
  };

  const onShowCategoryFilter = () => {
    setIsCategoryFilterVisible(true)
  };

  return (
    <div className="section">
      <div className="d-flex pb-4 mb-4 align-items-center gap-4 ">
        <NavLink to={`/store-listing`} className="back-to-category-list d-flex align-items-center">
          <i className="pi pi-angle-left w-bold" />
        </NavLink>
        <h1 className="category-name">{capitalize(category)}</h1>
      </div>
      <hr className="clr-gray-light mb-4" />
      <div className="d-lg-flex gap-4 mt-4">
        <div className="d-inline-flex d-lg-none mb-4 justify-content-end px-4 w-100">
          <div className="filter-icon" onClick={onShowCategoryFilter}>
            <img src={FilterIcon} alt="filter-icon" />
          </div>
          <Dialog header="Category Filter" visible={isCategoryFilterVisible} onHide={onHideCategoryFilter}>
            <CategoryFilter />
            <Button className="p-default mx-4" onClick={onHideCategoryFilter} label="Filter" />
          </Dialog>
        </div>   
        <div className="col-12 d-none d-lg-inline-block col-lg-3 filter">
          <CategoryFilter />
        </div>
        <div className="col-12 col-lg-9">
          <StoreListing selectedCategory={capitalize(category)} />
        </div>
      </div>
    </div>
  );
}
