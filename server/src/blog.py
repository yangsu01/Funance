from flask import Blueprint, jsonify
from markdown import markdown

from .data_models import db, Blog
from .utils.time_functions import utc_to_est

blog = Blueprint('blog', __name__)

# routes
@blog.route('/blog-list', methods=['GET'])
def blog_list():
    '''Get a list of all blogs
    '''
    blogs = Blog.query.order_by(Blog.updated_date.desc()).all()

    blog_info = []

    if blogs is not None:
        for blog in blogs:
            blog_info.append({
                'title': blog.title,
                'date': blog.updated_date.strftime('%b %d, %Y'),
                'description': blog.description,
                'fileName': blog.file_name
            })

    return jsonify(
        data=blog_info,
        msg='success'
        ), 200


@blog.route('/blog/<file_name>', methods=['GET'])
def blog_view(file_name: str):
    ''' Get the blog content

        args:
            file_name (str): file name of the blog
    '''
    blog = Blog.query.filter_by(file_name=file_name).first()

    if blog is None:
        return jsonify(msg='Blog does not exist!'), 404
    
    blog_data = {
        'title': blog.title,
        'creationDate': blog.creation_date.strftime('%b %d, %Y'),
        'creationDate': blog.updated_date.strftime('%b %d, %Y'),
        'description': blog.description,
        'content': markdown(blog.content),
        'fileName': blog.file_name
    }

    columns = db.session.query(Blog.file_name, Blog.title).all()

    blog_catalog = []

    if columns is not None:
        for column in columns:
            blog_catalog.append({
                'title': column.title,
                'fileName': column.file_name
            })

    return jsonify(
        data={'blogData': blog_data, 'blogCatalog': blog_catalog},
        msg='success'
    ), 200